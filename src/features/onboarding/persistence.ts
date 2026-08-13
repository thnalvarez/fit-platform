import { supabase } from "../../services/supabase";
import {
  BiologicalSex,
  ExperienceProfileUpdate,
  LimitationsProfileUpdate,
  PreferencesProfileUpdate,
  PrimaryGoal,
  RoutineProfileUpdate,
  SecondaryGoal,
  TrainingLocationProfileUpdate,
} from "./types";

export async function loadAuthenticatedProfileSex() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("[ONBOARDING] profile sex: failed to get user", userError);
    throw new Error(
      "Não foi possível identificar sua conta. Entre novamente e tente de novo.",
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("sex")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[ONBOARDING] profile sex: query failed", error);
    throw new Error("Não foi possível carregar seu perfil. Tente novamente.");
  }

  if (!data) {
    console.error("[ONBOARDING] profile sex: profile row not found", {
      userId: user.id,
    });
    throw new Error("Seu perfil não pôde ser encontrado.");
  }

  return data.sex as BiologicalSex | null;
}

async function updateAuthenticatedProfile(
  values: Record<string, unknown>,
  context: string,
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error(`[ONBOARDING] ${context}: failed to get user`, userError);
    throw new Error("Não foi possível identificar sua conta. Entre novamente e tente de novo.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select("id");

  if (error) {
    console.error(`[ONBOARDING] ${context}: update failed`, error);
    throw new Error("Não foi possível salvar suas respostas. Tente novamente.");
  }

  if (!data || data.length === 0) {
    console.error(`[ONBOARDING] ${context}: no profile row updated`, {
      userId: user.id,
    });
    throw new Error("Seu perfil não pôde ser encontrado ou atualizado.");
  }

  return data[0].id as string;
}

export function saveGoals(
  primaryGoal: PrimaryGoal,
  secondaryGoal: SecondaryGoal | null,
) {
  return updateAuthenticatedProfile(
    {
      primary_goal: primaryGoal,
      secondary_goal: secondaryGoal === "none" ? null : secondaryGoal,
    },
    "goals",
  );
}

export function saveRoutine(values: RoutineProfileUpdate) {
  return updateAuthenticatedProfile(values, "routine");
}

export function saveExperience(values: ExperienceProfileUpdate) {
  return updateAuthenticatedProfile(values, "experience");
}

export function saveTrainingLocation(values: TrainingLocationProfileUpdate) {
  return updateAuthenticatedProfile(values, "training location");
}

export function savePreferences(values: PreferencesProfileUpdate) {
  return updateAuthenticatedProfile(values, "preferences");
}

export function saveLimitations(values: LimitationsProfileUpdate) {
  return updateAuthenticatedProfile(values, "limitations");
}
