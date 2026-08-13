import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";

const requiredVariables = [
  "EXPO_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_KEY",
  "SECURITY_TEST_USER_A_EMAIL",
  "SECURITY_TEST_USER_A_PASSWORD",
  "SECURITY_TEST_USER_B_EMAIL",
  "SECURITY_TEST_USER_B_PASSWORD",
];

const results = [];
const temporaryRecords = {
  userA: new Set(),
  userB: new Set(),
};

let clientA;
let clientB;
let userA;
let userB;
let originalUserBUpdatedAt;
let userBProfileChanged = false;
let cleanupFailed = false;

class SecurityFailure extends Error {
  constructor(section, message) {
    super(message);
    this.section = section;
  }
}
class InfrastructureFailure extends Error {}
class AuthenticationFailure extends InfrastructureFailure {
  constructor(label, error) {
    super(`${label} authentication failed.`);
    this.label = label;
    this.code = getSafeAuthCode(error);
    this.status = getSafeAuthStatus(error);
  }
}

function pass(section, message) {
  results.push({ status: "PASS", section, message });
}

function fail(section, message, type, diagnostic) {
  results.push({ status: "FAIL", section, message, type, diagnostic });
}

function classifyAuthError(error) {
  const message = typeof error?.message === "string" ? error.message.toLowerCase() : "";

  if (message.includes("invalid") && message.includes("credential")) {
    return "INVALID_CREDENTIALS";
  }
  if (message.includes("email") && message.includes("not confirmed")) {
    return "EMAIL_NOT_CONFIRMED";
  }
  if (message.includes("rate limit") || message.includes("too many request")) {
    return "RATE_LIMIT";
  }
  if (message.includes("provider") && message.includes("disabled")) {
    return "PROVIDER_DISABLED";
  }
  if (
    message.includes("network") ||
    message.includes("fetch failed") ||
    message.includes("failed to fetch")
  ) {
    return "NETWORK_ERROR";
  }

  return "UNKNOWN_AUTH_ERROR";
}

function getSafeAuthCode(error) {
  if (
    typeof error?.code === "string" &&
    /^[a-z0-9_]+$/i.test(error.code)
  ) {
    return error.code;
  }

  return classifyAuthError(error);
}

function getSafeAuthStatus(error) {
  return Number.isInteger(error?.status) && error.status >= 100 && error.status <= 599
    ? error.status
    : undefined;
}

function requireEnvironment() {
  const missing = requiredVariables.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new InfrastructureFailure(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

  if (!url.startsWith("https://")) {
    throw new InfrastructureFailure("Supabase URL must use HTTPS.");
  }

  assertNonPrivilegedKey(key);

  return {
    url,
    key,
    userAEmail: process.env.SECURITY_TEST_USER_A_EMAIL,
    userAPassword: process.env.SECURITY_TEST_USER_A_PASSWORD,
    userBEmail: process.env.SECURITY_TEST_USER_B_EMAIL,
    userBPassword: process.env.SECURITY_TEST_USER_B_PASSWORD,
  };
}

function assertNonPrivilegedKey(key) {
  if (key.startsWith("sb_secret_") || key.toLowerCase().includes("service_role")) {
    throw new InfrastructureFailure(
      "Refusing to run with a secret or service-role key.",
    );
  }

  const parts = key.split(".");
  if (parts.length !== 3) return;

  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8"),
    );
    if (payload.role === "service_role") {
      throw new InfrastructureFailure(
        "Refusing to run with a service-role JWT.",
      );
    }
  } catch (error) {
    if (error instanceof InfrastructureFailure) throw error;
  }
}

function createIsolatedClient(url, key) {
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

async function authenticate(client, email, password, label) {
  let signInError;

  try {
    ({ error: signInError } = await client.auth.signInWithPassword({
      email,
      password,
    }));
  } catch (error) {
    throw new AuthenticationFailure(label, error);
  }

  if (signInError) {
    throw new AuthenticationFailure(label, signInError);
  }

  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user) {
    throw new InfrastructureFailure(`${label} session could not be verified.`);
  }

  pass("Authentication", `${label} authenticated`);
  return user;
}

async function testProfiles() {
  const { data: ownProfile, error: ownError } = await clientA
    .from("profiles")
    .select("id")
    .eq("id", userA.id);

  if (ownError || ownProfile?.length !== 1) {
    throw new InfrastructureFailure(
      "User A could not read exactly one own profile.",
    );
  }
  pass("profiles", "A can read own profile");

  const { data: otherProfile, error: otherError } = await clientA
    .from("profiles")
    .select("id")
    .eq("id", userB.id);

  if (otherError) {
    throw new InfrastructureFailure("Cross-user profile read test failed unexpectedly.");
  }
  if ((otherProfile?.length ?? 0) !== 0) {
    throw new SecurityFailure("profiles", "A can read B profile");
  }
  pass("profiles", "A cannot read B profile");

  const { data: userBProfile, error: userBProfileError } = await clientB
    .from("profiles")
    .select("updated_at")
    .eq("id", userB.id);

  if (userBProfileError || userBProfile?.length !== 1) {
    throw new InfrastructureFailure(
      "User B profile state could not be prepared for the reversible update test.",
    );
  }

  originalUserBUpdatedAt = userBProfile[0].updated_at;
  const testTimestamp = "2000-01-01T00:00:00.000Z";
  const { data: updatedRows, error: updateError } = await clientA
    .from("profiles")
    .update({ updated_at: testTimestamp })
    .eq("id", userB.id)
    .select("id");

  if (updateError) {
    throw new InfrastructureFailure(
      "Cross-user profile update test returned an unexpected database error.",
    );
  }
  if ((updatedRows?.length ?? 0) !== 0) {
    userBProfileChanged = true;
    throw new SecurityFailure("profiles", "A can update B profile");
  }
  pass("profiles", "A cannot update B profile");
}

async function testMeasurementReads() {
  const { error: ownError } = await clientA
    .from("body_measurements")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userA.id);

  if (ownError) {
    throw new InfrastructureFailure("A could not query own measurements.");
  }
  pass("body_measurements", "A can query own measurements");

  const { count: otherCount, error: otherError } = await clientA
    .from("body_measurements")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userB.id);

  if (otherError) {
    throw new InfrastructureFailure(
      "Cross-user measurement read test failed unexpectedly.",
    );
  }
  if ((otherCount ?? 0) !== 0) {
    throw new SecurityFailure(
      "body_measurements",
      "A can read B measurements",
    );
  }
  pass("body_measurements", "A cannot read B measurements");
}

async function testForgedInsert() {
  const forgedId = randomUUID();
  const { data, error } = await clientA
    .from("body_measurements")
    .insert({ id: forgedId, user_id: userB.id, waist_cm: 30 })
    .select("id");

  const { data: visibleToOwner, error: verificationError } = await clientB
    .from("body_measurements")
    .select("id")
    .eq("id", forgedId);

  if (verificationError) {
    throw new InfrastructureFailure("Forged insert verification failed.");
  }

  if ((visibleToOwner?.length ?? 0) > 0) {
    temporaryRecords.userB.add(forgedId);
    throw new SecurityFailure(
      "body_measurements",
      "A can insert a measurement for B",
    );
  }

  if (!error || (data?.length ?? 0) > 0) {
    throw new InfrastructureFailure(
      "Forged insert produced an ambiguous response and no persisted row.",
    );
  }

  pass("body_measurements", "A cannot insert measurement for B");
}

async function insertTemporaryMeasurement(client, ownerId, ownerSet) {
  const { data, error } = await client
    .from("body_measurements")
    .insert({ user_id: ownerId, waist_cm: 30 })
    .select("id");

  if (error || data?.length !== 1) {
    throw new InfrastructureFailure("A temporary measurement could not be created.");
  }

  ownerSet.add(data[0].id);
  return data[0].id;
}

async function testLegitimateInsertAndDelete() {
  const recordId = await insertTemporaryMeasurement(
    clientA,
    userA.id,
    temporaryRecords.userA,
  );
  pass("body_measurements", "A can insert own temporary measurement");

  const { data: deletedRows, error: deleteError } = await clientA
    .from("body_measurements")
    .delete()
    .eq("id", recordId)
    .select("id");

  if (deleteError || deletedRows?.length !== 1) {
    throw new InfrastructureFailure("A could not delete own temporary measurement.");
  }

  temporaryRecords.userA.delete(recordId);

  const { data: remainingRows, error: confirmationError } = await clientA
    .from("body_measurements")
    .select("id")
    .eq("id", recordId);

  if (confirmationError || (remainingRows?.length ?? 0) !== 0) {
    throw new InfrastructureFailure("Own temporary measurement deletion was not confirmed.");
  }
  pass("body_measurements", "A can delete own temporary measurement");
}

async function testCrossUserDelete() {
  const recordId = await insertTemporaryMeasurement(
    clientB,
    userB.id,
    temporaryRecords.userB,
  );

  const { data: deletedByA, error: attackError } = await clientA
    .from("body_measurements")
    .delete()
    .eq("id", recordId)
    .select("id");

  if (attackError) {
    throw new InfrastructureFailure(
      "Cross-user delete test returned an unexpected database error.",
    );
  }
  if ((deletedByA?.length ?? 0) !== 0) {
    throw new SecurityFailure(
      "body_measurements",
      "A can delete B temporary measurement",
    );
  }

  const { data: ownerConfirmation, error: confirmationError } = await clientB
    .from("body_measurements")
    .select("id")
    .eq("id", recordId);

  if (confirmationError || ownerConfirmation?.length !== 1) {
    throw new SecurityFailure(
      "body_measurements",
      "B temporary measurement was not preserved after A delete attempt",
    );
  }

  pass("body_measurements", "A cannot delete B temporary measurement");
}

async function deleteTemporaryRecords(client, ids) {
  for (const id of ids) {
    const { data, error } = await client
      .from("body_measurements")
      .delete()
      .eq("id", id)
      .select("id");

    if (error || data?.length !== 1) cleanupFailed = true;
  }
  ids.clear();
}

async function cleanup() {
  if (userBProfileChanged && clientB && userB) {
    const { data, error } = await clientB
      .from("profiles")
      .update({ updated_at: originalUserBUpdatedAt })
      .eq("id", userB.id)
      .select("id");
    if (error || data?.length !== 1) cleanupFailed = true;
  }

  if (clientA) {
    await deleteTemporaryRecords(clientA, temporaryRecords.userA);
  }
  if (clientB) {
    await deleteTemporaryRecords(clientB, temporaryRecords.userB);
  }

  try {
    if (clientA) await clientA.auth.signOut({ scope: "local" });
    if (clientB) await clientB.auth.signOut({ scope: "local" });
  } catch {
    cleanupFailed = true;
  }
}

function printReport(finalResult, failureType) {
  console.log("SECURITY ISOLATION TEST\n");

  for (const section of [
    "Authentication",
    "profiles",
    "body_measurements",
    "Infrastructure",
  ]) {
    const sectionResults = results.filter((result) => result.section === section);
    if (sectionResults.length === 0) continue;
    console.log(section);
    for (const result of sectionResults) {
      console.log(`[${result.status}] ${result.message}`);
      if (result.diagnostic) {
        console.log(`Code: ${result.diagnostic.code}`);
        if (result.diagnostic.status !== undefined) {
          console.log(`Status: ${result.diagnostic.status}`);
        }
      }
    }
    console.log("");
  }

  if (cleanupFailed) {
    console.log("[FAIL] Temporary record cleanup could not be fully confirmed\n");
  } else if (userA || userB) {
    console.log("[PASS] Temporary records cleaned\n");
  }

  if (failureType) console.log(failureType);
  console.log("RESULT\n");
  console.log(finalResult);
}

async function main() {
  let finalResult = "PASS";
  let failureType;

  try {
    const environment = requireEnvironment();
    clientA = createIsolatedClient(environment.url, environment.key);
    clientB = createIsolatedClient(environment.url, environment.key);

    userA = await authenticate(
      clientA,
      environment.userAEmail,
      environment.userAPassword,
      "User A",
    );
    userB = await authenticate(
      clientB,
      environment.userBEmail,
      environment.userBPassword,
      "User B",
    );

    if (userA.id === userB.id) {
      throw new InfrastructureFailure("User A and User B must be different accounts.");
    }

    await testProfiles();
    await testMeasurementReads();
    await testForgedInsert();
    await testLegitimateInsertAndDelete();
    await testCrossUserDelete();
  } catch (error) {
    finalResult = "FAIL";
    if (error instanceof SecurityFailure) {
      failureType = "SECURITY FAILURE";
      fail(error.section, error.message, failureType);
    } else if (error instanceof AuthenticationFailure) {
      failureType = "TEST INFRASTRUCTURE FAILURE";
      fail("Authentication", error.message, failureType, {
        code: error.code,
        status: error.status,
      });
    } else {
      failureType = "TEST INFRASTRUCTURE FAILURE";
      const message =
        error instanceof InfrastructureFailure
          ? error.message
          : "Unexpected test infrastructure error.";
      fail("Infrastructure", message, failureType);
    }
  } finally {
    await cleanup();
  }

  if (cleanupFailed) {
    finalResult = "FAIL";
    failureType = "TEST INFRASTRUCTURE FAILURE";
  }

  printReport(finalResult, failureType);
  if (finalResult === "FAIL") process.exitCode = 1;
}

await main();
