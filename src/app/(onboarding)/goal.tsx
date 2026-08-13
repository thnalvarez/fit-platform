import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "../../components/ui/Button";
import { supabase } from "../../services/supabase";
import { colors, spacing, typography } from "../../theme";

type Goal =
  | "fat_loss"
  | "muscle_gain"
  | "body_recomposition"
  | "strength"
  | "conditioning"
  | "health";

const goals: { label: string; value: Goal }[] = [
  { label: "Perder gordura", value: "fat_loss" },
  { label: "Ganhar massa muscular", value: "muscle_gain" },
  { label: "Recomposição corporal", value: "body_recomposition" },
  { label: "Ganhar força", value: "strength" },
  { label: "Melhorar condicionamento", value: "conditioning" },
  { label: "Saúde e qualidade de vida", value: "health" },
];

export default function GoalScreen() {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleSelect(goal: Goal) {
    setSelectedGoal(goal);
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  async function handleContinue() {
    if (loading) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedGoal) {
      setErrorMessage("Selecione seu principal objetivo.");
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("[GOAL] Failed to get authenticated user", userError);
        setErrorMessage(
          userError?.message ?? "Não foi possível identificar sua conta.",
        );
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({ primary_goal: selectedGoal })
        .eq("id", user.id)
        .select("id");

      if (error) {
        console.error("[GOAL] Failed to update primary goal", error);
        setErrorMessage(error.message);
        return;
      }

      if (!data || data.length === 0) {
        console.error("[GOAL] Profile update returned no rows", {
          userId: user.id,
        });
        setErrorMessage(
          "Seu perfil não pôde ser encontrado ou atualizado.",
        );
        return;
      }

      console.log("[GOAL] Primary goal saved", {
        profileId: data[0].id,
        primaryGoal: selectedGoal,
      });
      setSuccessMessage("Objetivo salvo com sucesso.");
    } catch (error) {
      console.error("[GOAL] Unexpected error while saving", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado ao salvar seu objetivo.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.step}>ETAPA 2 DE 4</Text>

          <Text style={styles.title}>Seu objetivo</Text>

          <Text style={styles.description}>
            Qual é o seu principal objetivo neste momento?
          </Text>
        </View>

        <View style={styles.options}>
          {goals.map((goal) => {
            const isSelected = selectedGoal === goal.value;

            return (
              <Pressable
                key={goal.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                disabled={loading}
                onPress={() => handleSelect(goal.value)}
                style={({ pressed }) => [
                  styles.option,
                  isSelected && styles.optionSelected,
                  pressed && styles.optionPressed,
                ]}
              >
                <View
                  style={[
                    styles.selectionIndicator,
                    isSelected && styles.selectionIndicatorSelected,
                  ]}
                />

                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {goal.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        <Button
          title="Continuar"
          disabled={!selectedGoal}
          loading={loading}
          onPress={handleContinue}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.xl,
  },

  step: {
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

  options: {
    gap: spacing.md,
  },

  option: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceSecondary,
  },

  optionPressed: {
    opacity: 0.8,
  },

  selectionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.secondary,
  },

  selectionIndicatorSelected: {
    borderWidth: 6,
    borderColor: colors.accent,
    backgroundColor: colors.primary,
  },

  optionText: {
    flex: 1,
    color: colors.secondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },

  optionTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
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
    fontSize: typography.fontSize.md,
    lineHeight: 22,
  },

  successBox: {
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.success,
    backgroundColor: colors.surface,
  },

  successText: {
    color: colors.success,
    fontSize: typography.fontSize.md,
    lineHeight: 22,
  },
});
