import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { OnboardingHeader } from "../../components/onboarding/OnboardingHeader";
import { SelectableChip } from "../../components/onboarding/SelectableChip";
import { StatusMessage } from "../../components/onboarding/StatusMessage";
import { Button } from "../../components/ui/Button";
import {
  avoidedTrainingMethodOptions,
  detailedMusclePriorityOptions,
  muscleGroupOptions,
  preferredTrainingMethodOptions,
} from "../../features/onboarding/options";
import { savePreferences } from "../../features/onboarding/persistence";
import {
  AvoidedTrainingMethod,
  DetailedMusclePriority,
  MuscleGroup,
  PreferredTrainingMethod,
} from "../../features/onboarding/types";
import { colors, spacing, typography } from "../../theme";

const ADVANCED_FAMILIARITY = ["broad_experience", "advanced_programming_familiarity"];

export default function PreferencesScreen() {
  const { primaryGoal, technicalFamiliarity, bodybuildingFocus } = useLocalSearchParams<{
    primaryGoal?: string;
    technicalFamiliarity?: string;
    bodybuildingFocus?: string;
  }>();
  const [preferredMethods, setPreferredMethods] = useState<PreferredTrainingMethod[]>([]);
  const [avoidedMethods, setAvoidedMethods] = useState<AvoidedTrainingMethod[]>([]);
  const [priorityMuscleGroups, setPriorityMuscleGroups] = useState<MuscleGroup[]>([]);
  const [detailedPriorities, setDetailedPriorities] = useState<DetailedMusclePriority[]>([]);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const showDetailedPriorities =
    (bodybuildingFocus !== undefined && bodybuildingFocus !== "" && bodybuildingFocus !== "no") ||
    (primaryGoal === "muscle_gain" &&
      technicalFamiliarity !== undefined &&
      ADVANCED_FAMILIARITY.includes(technicalFamiliarity));

  function toggleExclusive<T extends string>(current: T[], value: T, exclusive: T) {
    if (value === exclusive) return current.includes(value) ? [] : [value];
    const withoutExclusive = current.filter((item) => item !== exclusive);
    return withoutExclusive.includes(value)
      ? withoutExclusive.filter((item) => item !== value)
      : [...withoutExclusive, value];
  }

  function toggleMuscleGroup(value: MuscleGroup) {
    setInfoMessage(null);
    setPriorityMuscleGroups((current) => {
      if (value === "no_specific_priority") {
        return current.includes(value) ? [] : [value];
      }
      const withoutNone = current.filter((group) => group !== "no_specific_priority");
      if (withoutNone.includes(value)) return withoutNone.filter((group) => group !== value);
      if (withoutNone.length >= 3) {
        setInfoMessage("Você pode selecionar no máximo 3 grupos prioritários.");
        return withoutNone;
      }
      return [...withoutNone, value];
    });
  }

  function toggleDetailedPriority(value: DetailedMusclePriority) {
    setDetailedPriorities((current) =>
      current.includes(value)
        ? current.filter((priority) => priority !== value)
        : [...current, value],
    );
  }

  async function handleContinue() {
    if (loading) return;

    setErrorMessage(null);

    try {
      setLoading(true);
      await savePreferences({
        preferred_training_methods:
          preferredMethods.length > 0 ? preferredMethods : null,
        avoided_training_methods:
          avoidedMethods.length > 0 ? avoidedMethods : null,
        priority_muscle_groups:
          priorityMuscleGroups.length > 0 ? priorityMuscleGroups : null,
        detailed_muscle_priorities:
          showDetailedPriorities && detailedPriorities.length > 0
            ? detailedPriorities
            : null,
      });
      router.push("/(onboarding)/limitations");
    } catch (error) {
      console.error("[PREFERENCES] Unexpected error while saving", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado ao salvar suas preferências.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <OnboardingHeader step={6} title="Preferências de treino" description="Essas respostas são opcionais. Elas ajudam a deixar seu programa mais próximo do que você gosta de fazer." />

        <Question title="Que formas de treino você mais gosta?">
          {preferredTrainingMethodOptions.map((option) => (
            <SelectableChip key={option.value} label={option.label} selected={preferredMethods.includes(option.value)} onPress={() => setPreferredMethods((current) => toggleExclusive(current, option.value, "no_preference"))} />
          ))}
        </Question>

        <Question title="Existe alguma forma de treino que você prefere evitar?" helper="Isso representa preferência. Dores e limitações serão tratadas na próxima etapa.">
          {avoidedTrainingMethodOptions.map((option) => (
            <SelectableChip key={option.value} label={option.label} selected={avoidedMethods.includes(option.value)} onPress={() => setAvoidedMethods((current) => toggleExclusive(current, option.value, "none"))} />
          ))}
        </Question>

        <Question title="Quais grupos você gostaria de priorizar?" helper="Opcional. Selecione no máximo 3.">
          {muscleGroupOptions.map((option) => (
            <SelectableChip key={option.value} label={option.label} selected={priorityMuscleGroups.includes(option.value)} onPress={() => toggleMuscleGroup(option.value)} />
          ))}
        </Question>

        {showDetailedPriorities ? (
          <Question title="Quer detalhar alguma prioridade?" helper="Opcional.">
            {detailedMusclePriorityOptions.map((option) => (
              <SelectableChip key={option.value} label={option.label} selected={detailedPriorities.includes(option.value)} onPress={() => toggleDetailedPriority(option.value)} />
            ))}
          </Question>
        ) : null}

        {infoMessage ? <StatusMessage variant="info" message={infoMessage} /> : null}
        {errorMessage ? <StatusMessage message={errorMessage} /> : null}
        <Button title="Continuar" loading={loading} onPress={handleContinue} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Question({ title, helper, children }: { title: string; helper?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{title}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
      <View style={styles.chipList}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, gap: spacing.xl },
  section: { gap: spacing.md },
  label: { color: colors.primary, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, lineHeight: 23 },
  helper: { color: colors.secondary, fontSize: typography.fontSize.sm, lineHeight: 20 },
  chipList: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
