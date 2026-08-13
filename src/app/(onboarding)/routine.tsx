import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { OnboardingHeader } from "../../components/onboarding/OnboardingHeader";
import { SelectableCard } from "../../components/onboarding/SelectableCard";
import { SelectableChip } from "../../components/onboarding/SelectableChip";
import { StatusMessage } from "../../components/onboarding/StatusMessage";
import { Button } from "../../components/ui/Button";
import {
  dailyPhysicalDemandOptions,
  preferredTrainingTimeOptions,
  scheduleTypeOptions,
  sessionDurationOptions,
  trainingDayCountOptions,
  weekdayOptions,
} from "../../features/onboarding/options";
import { saveRoutine } from "../../features/onboarding/persistence";
import {
  DailyPhysicalDemand,
  PreferredTrainingTime,
  ScheduleType,
  Weekday,
} from "../../features/onboarding/types";
import { colors, spacing, typography } from "../../theme";

export default function RoutineScreen() {
  const { primaryGoal } = useLocalSearchParams<{ primaryGoal?: string }>();
  const [dailyPhysicalDemand, setDailyPhysicalDemand] = useState<DailyPhysicalDemand | null>(null);
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState<number | null>(null);
  const [scheduleType, setScheduleType] = useState<ScheduleType | null>(null);
  const [availableTrainingDays, setAvailableTrainingDays] = useState<Weekday[]>([]);
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState<number | null>(null);
  const [preferredTrainingTime, setPreferredTrainingTime] = useState<PreferredTrainingTime | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requiresFixedDays = scheduleType === "fixed";
  const hasExactDayCount =
    trainingDaysPerWeek !== null &&
    availableTrainingDays.length === trainingDaysPerWeek;
  const isComplete =
    dailyPhysicalDemand !== null &&
    trainingDaysPerWeek !== null &&
    scheduleType !== null &&
    (!requiresFixedDays || hasExactDayCount) &&
    sessionDurationMinutes !== null;

  function handleTrainingDayCount(value: number) {
    setTrainingDaysPerWeek(value);
    setAvailableTrainingDays([]);
    setErrorMessage(null);
  }

  function handleScheduleType(value: ScheduleType) {
    setScheduleType(value);
    if (value === "variable") setAvailableTrainingDays([]);
    setErrorMessage(null);
  }

  function toggleWeekday(value: Weekday) {
    if (!trainingDaysPerWeek) return;
    setErrorMessage(null);
    setAvailableTrainingDays((current) => {
      if (current.includes(value)) return current.filter((day) => day !== value);
      if (current.length >= trainingDaysPerWeek) return current;
      return [...current, value];
    });
  }

  async function handleContinue() {
    if (loading) return;

    setErrorMessage(null);
    if (!isComplete) {
      setErrorMessage("Complete todas as perguntas obrigatórias antes de continuar.");
      return;
    }

    if (
      dailyPhysicalDemand === null ||
      trainingDaysPerWeek === null ||
      scheduleType === null ||
      sessionDurationMinutes === null
    ) {
      setErrorMessage("Complete todas as perguntas obrigatórias antes de continuar.");
      return;
    }

    try {
      setLoading(true);
      await saveRoutine({
        daily_physical_demand: dailyPhysicalDemand,
        training_days_per_week: trainingDaysPerWeek,
        schedule_type: scheduleType,
        available_training_days:
          scheduleType === "fixed" ? availableTrainingDays : null,
        session_duration_minutes: sessionDurationMinutes,
        preferred_training_time: preferredTrainingTime,
      });
      router.push({
        pathname: "/(onboarding)/experience",
        params: { primaryGoal: primaryGoal ?? "" },
      });
    } catch (error) {
      console.error("[ROUTINE] Unexpected error while saving", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado ao salvar sua rotina.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <OnboardingHeader
          step={3}
          title="Rotina e disponibilidade"
          description="Vamos adaptar seu programa ao tempo e à recuperação que você realmente tem disponíveis."
        />

        <View style={styles.section}>
          <Text style={styles.label}>Como é a exigência física da maior parte da sua rotina?</Text>
          <View style={styles.cardList}>
            {dailyPhysicalDemandOptions.map((option) => (
              <SelectableCard key={option.value} label={option.label} selected={dailyPhysicalDemand === option.value} onPress={() => setDailyPhysicalDemand(option.value)} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Quantos dias você consegue manter na maioria das semanas?</Text>
          <View style={styles.chipList}>
            {trainingDayCountOptions.map((value) => (
              <SelectableChip key={value} label={String(value)} selected={trainingDaysPerWeek === value} accessibilityRole="radio" onPress={() => handleTrainingDayCount(value)} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Seus dias de treino costumam ser fixos?</Text>
          <View style={styles.cardList}>
            {scheduleTypeOptions.map((option) => (
              <SelectableCard key={option.value} label={option.label} selected={scheduleType === option.value} onPress={() => handleScheduleType(option.value)} />
            ))}
          </View>
        </View>

        {requiresFixedDays ? (
          <View style={styles.section}>
            <Text style={styles.label}>Em quais dias você normalmente consegue treinar?</Text>
            <Text style={styles.helper}>
              {trainingDaysPerWeek ? `Selecione ${trainingDaysPerWeek} dias` : "Informe primeiro quantos dias consegue manter"}
            </Text>
            <View style={styles.chipList}>
              {weekdayOptions.map((option) => (
                <SelectableChip key={option.value} label={option.label} selected={availableTrainingDays.includes(option.value)} disabled={!trainingDaysPerWeek} onPress={() => toggleWeekday(option.value)} />
              ))}
            </View>
            {trainingDaysPerWeek ? (
              <Text style={hasExactDayCount ? styles.helperComplete : styles.helper}>
                {availableTrainingDays.length} de {trainingDaysPerWeek} dias selecionados
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.label}>Quanto tempo você realmente possui por sessão, incluindo aquecimento?</Text>
          <View style={styles.chipList}>
            {sessionDurationOptions.map((value) => (
              <SelectableChip key={value} label={`${value} min`} selected={sessionDurationMinutes === value} accessibilityRole="radio" onPress={() => setSessionDurationMinutes(value)} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Em qual período você prefere treinar?</Text>
          <Text style={styles.helper}>Opcional.</Text>
          <View style={styles.cardList}>
            {preferredTrainingTimeOptions.map((option) => (
              <SelectableCard key={option.value} label={option.label} selected={preferredTrainingTime === option.value} onPress={() => setPreferredTrainingTime(option.value)} />
            ))}
          </View>
        </View>

        {errorMessage ? <StatusMessage message={errorMessage} /> : null}
        <Button title="Continuar" disabled={!isComplete} loading={loading} onPress={handleContinue} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, gap: spacing.xl },
  section: { gap: spacing.sm },
  label: { color: colors.primary, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, lineHeight: 23 },
  helper: { color: colors.secondary, fontSize: typography.fontSize.sm, lineHeight: 20 },
  helperComplete: { color: colors.success, fontSize: typography.fontSize.sm, lineHeight: 20 },
  cardList: { gap: spacing.sm },
  chipList: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
