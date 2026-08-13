import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { supabase } from "../../services/supabase";
import { colors, spacing, typography } from "../../theme";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function showError(title: string, message: string) {
    setErrorMessage(message);

    if (Platform.OS !== "web") {
      Alert.alert(title, message);
    }
  }

  async function handleRegister() {
    setErrorMessage(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      console.warn("[REGISTER] validation failed: required fields");
      showError("Campos obrigatórios", "Preencha todos os campos.");
      return;
    }

    if (password.length < 6) {
      console.warn("[REGISTER] validation failed: password too short");
      showError(
        "Senha muito curta",
        "Sua senha precisa ter pelo menos 6 caracteres.",
      );
      return;
    }

    console.log("[REGISTER] validation passed");

    try {
      setLoading(true);
      console.log("[REGISTER] calling Supabase");

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      console.log("[REGISTER] Supabase response", {
        error: error?.message ?? null,
        hasUser: Boolean(data.user),
        hasSession: Boolean(data.session),
        userId: data.user?.id ?? null,
      });

      if (error) {
        showError("Não foi possível criar a conta", error.message);
        return;
      }

      if (!data.user) {
        showError(
          "Erro",
          "Não foi possível criar sua conta. Tente novamente.",
        );
        return;
      }

      console.log("[REGISTER] navigating");
      router.replace("/(onboarding)/profile");
    } catch (error) {
      console.error("[REGISTER] unexpected error", error);
      showError(
        "Erro inesperado",
        error instanceof Error
          ? error.message
          : "Ocorreu um problema ao criar sua conta.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <Text style={styles.eyebrow}>CRIAR CONTA</Text>

            <Text style={styles.title}>Comece sua evolução.</Text>

            <Text style={styles.description}>
              Crie sua conta para montar seu acompanhamento personalizado.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Nome"
              placeholder="Seu nome"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="E-mail"
              placeholder="voce@email.com"
              value={email}
              onChangeText={setEmail}
            />

            <Input
              label="Senha"
              placeholder="Crie uma senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Button
              title="Criar conta"
              loading={loading}
              onPress={() => {
                console.log("[REGISTER] button pressed");
                void handleRegister();
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.xxl,
  },

  eyebrow: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },

  title: {
    color: colors.primary,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },

  description: {
    color: colors.secondary,
    fontSize: typography.fontSize.md,
    lineHeight: 24,
    marginTop: spacing.md,
  },

  form: {
    gap: spacing.lg,
  },

  errorBox: {
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.surface,
  },

  errorText: {
    color: colors.danger,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
});
