import { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { OnboardingHeader } from "../../components/onboarding/OnboardingHeader";
import { SelectableCard } from "../../components/onboarding/SelectableCard";
import { StatusMessage } from "../../components/onboarding/StatusMessage";
import { Button } from "../../components/ui/Button";
import {
  dailyEnergyLevelOptions,
  perceivedRecoveryOptions,
  perceivedStressOptions,
  scheduleVariabilityOptions,
  sleepDurationRangeOptions,
  sleepQualityOptions,
  sleepRegularityOptions,
  yesNoOptions,
} from "../../features/onboarding/options";
import {
  buildRecoveryProfileUpdate,
  isRecoveryDraftComplete,
  RecoveryDraft,
} from "../../features/onboarding/recovery";
import { YesNoAnswer } from "../../features/onboarding/types";
import { colors, spacing, typography } from "../../theme";

const initialDraft: RecoveryDraft = {
  sleepDurationRange: null,
  sleepQuality: null,
  sleepRegularity: null,
  perceivedStress: null,
  perceivedRecovery: null,
  dailyEnergyLevel: null,
  hasVariableSchedule: null,
  scheduleVariability: null,
};

export default function RecoveryScreen() {
  const [draft, setDraft] = useState<RecoveryDraft>(initialDraft);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const isComplete = isRecoveryDraftComplete(draft);

  function updateDraft<Key extends keyof RecoveryDraft>(
    key: Key,
    value: RecoveryDraft[Key],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrorMessage(null);
  }

  function handleVariableSchedule(value: YesNoAnswer) {
    setDraft((current) => ({
      ...current,
      hasVariableSchedule: value,
      scheduleVariability:
        value === "yes" ? current.scheduleVariability : null,
    }));
    setErrorMessage(null);
  }

  function handleContinue() {
    setErrorMessage(null);
    const payload = buildRecoveryProfileUpdate(draft);

    if (!payload) {
      setErrorMessage(
        "Responda todas as perguntas obrigatórias antes de continuar.",
      );
      return;
    }

    // The normalized payload remains local until migration 007 is approved.
    setCompleted(true);
  }

  if (completed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completedContent}>
          <StatusMessage
            variant="success"
            message="Hábitos registrados para revisão"
          />
          <Text style={styles.nextStep}>
            Próxima etapa: saúde e dispositivos
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingHeader
          step={9}
          title="Hábitos e recuperação"
          description="Seu treino funciona melhor quando também considera sono, estresse e recuperação."
        />

        <StatusMessage
          variant="info"
          message="Não precisa ter uma rotina perfeita. Queremos entender como é sua realidade na maioria das semanas."
        />

        <View style={styles.group}>
          <Text style={styles.groupTitle}>SONO</Text>

          <Question
            label="Em média, quantas horas você dorme por noite?"
            options={sleepDurationRangeOptions}
            selected={draft.sleepDurationRange}
            onSelect={(value) => updateDraft("sleepDurationRange", value)}
          />

          <Question
            label="Como você avalia a qualidade do seu sono na maioria das noites?"
            helper="Considere facilidade para dormir, despertares e como você se sente ao acordar."
            options={sleepQualityOptions}
            selected={draft.sleepQuality}
            onSelect={(value) => updateDraft("sleepQuality", value)}
          />

          <Question
            label="Seus horários de sono costumam ser regulares?"
            options={sleepRegularityOptions}
            selected={draft.sleepRegularity}
            onSelect={(value) => updateDraft("sleepRegularity", value)}
          />
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>ROTINA</Text>

          <Question
            label="Como tem sido seu nível de estresse na maior parte das últimas duas semanas?"
            helper="Considere trabalho, estudos, família e outras demandas da rotina."
            options={perceivedStressOptions}
            selected={draft.perceivedStress}
            onSelect={(value) => updateDraft("perceivedStress", value)}
          />

          <Question
            label="Como costuma estar sua energia ao longo do dia?"
            options={dailyEnergyLevelOptions}
            selected={draft.dailyEnergyLevel}
            onSelect={(value) => updateDraft("dailyEnergyLevel", value)}
          />

          <Question
            label="Você trabalha ou estuda em horários que mudam frequentemente, incluindo turnos noturnos?"
            options={yesNoOptions}
            selected={draft.hasVariableSchedule}
            onSelect={handleVariableSchedule}
          />

          {draft.hasVariableSchedule === "yes" ? (
            <Question
              label="Com que frequência sua rotina muda?"
              options={scheduleVariabilityOptions}
              selected={draft.scheduleVariability}
              onSelect={(value) => updateDraft("scheduleVariability", value)}
            />
          ) : null}
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>RECUPERAÇÃO</Text>
          <Question
            label="Na maioria dos dias, como você se sente fisicamente recuperado?"
            options={perceivedRecoveryOptions}
            selected={draft.perceivedRecovery}
            onSelect={(value) => updateDraft("perceivedRecovery", value)}
          />
        </View>

        {errorMessage ? <StatusMessage message={errorMessage} /> : null}

        <Button
          title="Continuar"
          disabled={!isComplete}
          onPress={handleContinue}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Question<Value extends string>({
  label,
  helper,
  options,
  selected,
  onSelect,
}: {
  label: string;
  helper?: string;
  options: { label: string; value: Value }[];
  selected: Value | null;
  onSelect: (value: Value) => void;
}) {
  return (
    <View style={styles.question} accessibilityRole="radiogroup">
      <Text style={styles.questionLabel}>{label}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
      <View style={styles.cardList}>
        {options.map((option) => (
          <SelectableCard
            key={option.value}
            label={option.label}
            selected={selected === option.value}
            onPress={() => onSelect(option.value)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.xl,
  },
  completedContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  nextStep: {
    color: colors.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    textAlign: "center",
  },
  group: {
    gap: spacing.xl,
    padding: spacing.lg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  groupTitle: {
    color: colors.accent,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1.5,
  },
  question: { gap: spacing.sm },
  questionLabel: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 23,
  },
  helper: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  cardList: { gap: spacing.sm },
});
