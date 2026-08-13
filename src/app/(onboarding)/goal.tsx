import { router } from "expo-router";
import { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { OnboardingHeader } from "../../components/onboarding/OnboardingHeader";
import { SelectableCard } from "../../components/onboarding/SelectableCard";
import { StatusMessage } from "../../components/onboarding/StatusMessage";
import { Button } from "../../components/ui/Button";
import {
  primaryGoalOptions,
  secondaryGoalNoneOption,
} from "../../features/onboarding/options";
import { saveGoals } from "../../features/onboarding/persistence";
import { PrimaryGoal, SecondaryGoal } from "../../features/onboarding/types";
import { colors, spacing, typography } from "../../theme";

export default function GoalScreen() {
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal | null>(null);
  const [secondaryGoal, setSecondaryGoal] = useState<SecondaryGoal | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const secondaryGoalOptions = [
    secondaryGoalNoneOption,
    ...primaryGoalOptions.filter(({ value }) => value !== primaryGoal),
  ];

  function handlePrimaryGoal(value: PrimaryGoal) {
    setPrimaryGoal(value);
    setSecondaryGoal((current) => (current === value ? null : current));
    setErrorMessage(null);
  }

  async function handleContinue() {
    if (loading) return;

    setErrorMessage(null);

    if (!primaryGoal) {
      setErrorMessage("Selecione seu principal objetivo.");
      return;
    }

    if (secondaryGoal === primaryGoal) {
      setErrorMessage("O objetivo secundário deve ser diferente do principal.");
      return;
    }

    try {
      setLoading(true);
      await saveGoals(primaryGoal, secondaryGoal);
      router.push({
        pathname: "/(onboarding)/routine",
        params: {
          primaryGoal,
          secondaryGoal: secondaryGoal ?? "",
        },
      });
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <OnboardingHeader
          step={2}
          title="Seu objetivo"
          description="Qual é o seu principal objetivo neste momento?"
        />

        <View style={styles.cardList}>
          {primaryGoalOptions.map((option) => (
            <SelectableCard
              key={option.value}
              label={option.label}
              selected={primaryGoal === option.value}
              disabled={loading}
              onPress={() => handlePrimaryGoal(option.value)}
            />
          ))}
        </View>

        {primaryGoal ? (
          <View style={styles.section}>
            <Text style={styles.label}>Existe algum objetivo secundário?</Text>
            <Text style={styles.helper}>Opcional. Você pode escolher no máximo um.</Text>
            <View style={styles.cardList}>
              {secondaryGoalOptions.map((option) => (
                <SelectableCard
                  key={option.value}
                  label={option.label}
                  selected={secondaryGoal === option.value}
                  disabled={loading}
                  onPress={() => setSecondaryGoal(option.value)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {errorMessage ? <StatusMessage message={errorMessage} /> : null}

        <Button
          title="Continuar"
          disabled={!primaryGoal}
          loading={loading}
          onPress={handleContinue}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.xl,
  },
  section: { gap: spacing.md },
  cardList: { gap: spacing.md },
  label: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  helper: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
});
