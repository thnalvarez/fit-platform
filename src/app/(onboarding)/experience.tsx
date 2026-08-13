import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { OnboardingHeader } from "../../components/onboarding/OnboardingHeader";
import { SelectableCard } from "../../components/onboarding/SelectableCard";
import { SelectableChip } from "../../components/onboarding/SelectableChip";
import { StatusMessage } from "../../components/onboarding/StatusMessage";
import { Button } from "../../components/ui/Button";
import {
  bodybuildingFocusOptions,
  consistentTrainingExperienceOptions,
  programManagementOptions,
  recentTrainingFrequencyOptions,
  recentTrainingInterruptionOptions,
  technicalFamiliarityOptions,
} from "../../features/onboarding/options";
import { saveExperience } from "../../features/onboarding/persistence";
import {
  BodybuildingFocus,
  ConsistentTrainingExperience,
  ProgramManagement,
  RecentTrainingInterruption,
  TechnicalFamiliarity,
} from "../../features/onboarding/types";
import { colors, spacing, typography } from "../../theme";

const EXPERIENCED_DURATIONS: ConsistentTrainingExperience[] = [
  "1_to_2_years",
  "2_to_5_years",
  "more_than_5_years",
];

export default function ExperienceScreen() {
  const { primaryGoal } = useLocalSearchParams<{ primaryGoal?: string }>();
  const [consistentExperience, setConsistentExperience] = useState<ConsistentTrainingExperience | null>(null);
  const [recentFrequency, setRecentFrequency] = useState<number | null>(null);
  const [recentInterruption, setRecentInterruption] = useState<RecentTrainingInterruption | null>(null);
  const [technicalFamiliarity, setTechnicalFamiliarity] = useState<TechnicalFamiliarity | null>(null);
  const [followsStructuredProgram, setFollowsStructuredProgram] = useState<boolean | null>(null);
  const [programManagement, setProgramManagement] = useState<ProgramManagement | null>(null);
  const [bodybuildingFocus, setBodybuildingFocus] = useState<BodybuildingFocus | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasPreviousExperience = consistentExperience !== null && consistentExperience !== "never";
  const showsBodybuildingQuestion =
    consistentExperience !== null &&
    EXPERIENCED_DURATIONS.includes(consistentExperience) &&
    (primaryGoal === "muscle_gain" || primaryGoal === "body_recomposition");
  const isComplete =
    consistentExperience !== null &&
    recentFrequency !== null &&
    (!hasPreviousExperience || recentInterruption !== null) &&
    technicalFamiliarity !== null &&
    followsStructuredProgram !== null &&
    (!followsStructuredProgram || programManagement !== null);

  function handleExperience(value: ConsistentTrainingExperience) {
    setConsistentExperience(value);
    setErrorMessage(null);
    if (value === "never") {
      setRecentFrequency(0);
      setRecentInterruption(null);
    } else if (recentFrequency === 0) {
      setRecentFrequency(null);
    }
    if (!EXPERIENCED_DURATIONS.includes(value)) setBodybuildingFocus(null);
  }

  function handleProgramAnswer(value: boolean) {
    setFollowsStructuredProgram(value);
    if (!value) setProgramManagement(null);
  }

  async function handleContinue() {
    if (loading) return;

    setErrorMessage(null);
    if (!isComplete) {
      setErrorMessage("Complete todas as perguntas obrigatórias antes de continuar.");
      return;
    }
    if (
      consistentExperience === null ||
      recentFrequency === null ||
      technicalFamiliarity === null ||
      followsStructuredProgram === null
    ) {
      setErrorMessage("Complete todas as perguntas obrigatórias antes de continuar.");
      return;
    }

    try {
      setLoading(true);
      await saveExperience({
        consistent_training_experience: consistentExperience,
        recent_training_frequency:
          consistentExperience === "never" ? 0 : recentFrequency,
        recent_training_interruption:
          consistentExperience === "never" ? null : recentInterruption,
        technical_familiarity: technicalFamiliarity,
        follows_structured_program: followsStructuredProgram,
        program_management: followsStructuredProgram ? programManagement : null,
        bodybuilding_focus: showsBodybuildingQuestion ? bodybuildingFocus : null,
      });
      router.push({
        pathname: "/(onboarding)/training-location",
        params: {
          primaryGoal: primaryGoal ?? "",
          technicalFamiliarity,
          bodybuildingFocus: showsBodybuildingQuestion
            ? bodybuildingFocus ?? ""
            : "",
        },
      });
    } catch (error) {
      console.error("[EXPERIENCE] Unexpected error while saving", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado ao salvar sua experiência.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <OnboardingHeader step={4} title="Experiência de treino" description="Queremos entender sua experiência real, não apenas há quanto tempo você começou." />

        <Question title="Por quanto tempo você treinou musculação de forma consistente?">
          {consistentTrainingExperienceOptions.map((option) => (
            <SelectableCard key={option.value} label={option.label} selected={consistentExperience === option.value} onPress={() => handleExperience(option.value)} />
          ))}
        </Question>

        {consistentExperience !== "never" ? (
          <Question title="Em média, quantos dias por semana você treinou nas últimas 12 semanas?">
            <View style={styles.chipList}>
              {recentTrainingFrequencyOptions.map((value) => (
                <SelectableChip key={value} label={String(value)} selected={recentFrequency === value} accessibilityRole="radio" onPress={() => setRecentFrequency(value)} />
              ))}
            </View>
          </Question>
        ) : null}

        {hasPreviousExperience ? (
          <Question title="Qual foi sua maior interrupção recente?">
            {recentTrainingInterruptionOptions.map((option) => (
              <SelectableCard key={option.value} label={option.label} selected={recentInterruption === option.value} onPress={() => setRecentInterruption(option.value)} />
            ))}
          </Question>
        ) : null}

        <Question title="Qual opção melhor descreve sua familiaridade com musculação?">
          {technicalFamiliarityOptions.map((option) => (
            <SelectableCard key={option.value} label={option.label} selected={technicalFamiliarity === option.value} onPress={() => setTechnicalFamiliarity(option.value)} />
          ))}
        </Question>

        <Question title="Atualmente você segue uma programação estruturada de treino?">
          <SelectableCard label="Sim" selected={followsStructuredProgram === true} onPress={() => handleProgramAnswer(true)} />
          <SelectableCard label="Não" selected={followsStructuredProgram === false} onPress={() => handleProgramAnswer(false)} />
        </Question>

        {followsStructuredProgram ? (
          <Question title="Esse programa é acompanhado por um profissional?">
            {programManagementOptions.map((option) => (
              <SelectableCard key={option.value} label={option.label} selected={programManagement === option.value} onPress={() => setProgramManagement(option.value)} />
            ))}
          </Question>
        ) : null}

        {showsBodybuildingQuestion ? (
          <Question title="Seu treino tem foco específico em desenvolvimento estético/bodybuilding?" helper="Opcional.">
            {bodybuildingFocusOptions.map((option) => (
              <SelectableCard key={option.value} label={option.label} selected={bodybuildingFocus === option.value} onPress={() => setBodybuildingFocus(option.value)} />
            ))}
          </Question>
        ) : null}

        {errorMessage ? <StatusMessage message={errorMessage} /> : null}
        <Button title="Continuar" disabled={!isComplete} loading={loading} onPress={handleContinue} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Question({ title, helper, children }: { title: string; helper?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{title}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
      <View style={styles.cardList}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, gap: spacing.xl },
  section: { gap: spacing.sm },
  label: { color: colors.primary, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, lineHeight: 23 },
  helper: { color: colors.secondary, fontSize: typography.fontSize.sm, lineHeight: 20 },
  cardList: { gap: spacing.sm },
  chipList: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
