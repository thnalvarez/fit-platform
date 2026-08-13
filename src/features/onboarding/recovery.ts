import {
  DailyEnergyLevel,
  PerceivedRecovery,
  PerceivedStress,
  RecoveryProfileUpdate,
  ScheduleVariability,
  SleepDurationRange,
  SleepQuality,
  SleepRegularity,
  YesNoAnswer,
} from "./types";

export type RecoveryDraft = {
  sleepDurationRange: SleepDurationRange | null;
  sleepQuality: SleepQuality | null;
  sleepRegularity: SleepRegularity | null;
  perceivedStress: PerceivedStress | null;
  perceivedRecovery: PerceivedRecovery | null;
  dailyEnergyLevel: DailyEnergyLevel | null;
  hasVariableSchedule: YesNoAnswer | null;
  scheduleVariability: ScheduleVariability | null;
};

export function isRecoveryDraftComplete(draft: RecoveryDraft) {
  return (
    draft.sleepDurationRange !== null &&
    draft.sleepQuality !== null &&
    draft.sleepRegularity !== null &&
    draft.perceivedStress !== null &&
    draft.perceivedRecovery !== null &&
    draft.dailyEnergyLevel !== null &&
    draft.hasVariableSchedule !== null &&
    (draft.hasVariableSchedule === "no" || draft.scheduleVariability !== null)
  );
}

export function buildRecoveryProfileUpdate(
  draft: RecoveryDraft,
): RecoveryProfileUpdate | null {
  if (!isRecoveryDraftComplete(draft)) return null;

  if (
    draft.sleepDurationRange === null ||
    draft.sleepQuality === null ||
    draft.sleepRegularity === null ||
    draft.perceivedStress === null ||
    draft.perceivedRecovery === null ||
    draft.dailyEnergyLevel === null ||
    draft.hasVariableSchedule === null
  ) {
    return null;
  }

  return {
    sleep_duration_range: draft.sleepDurationRange,
    sleep_quality: draft.sleepQuality,
    sleep_regularity: draft.sleepRegularity,
    perceived_stress: draft.perceivedStress,
    perceived_recovery: draft.perceivedRecovery,
    daily_energy_level: draft.dailyEnergyLevel,
    has_variable_schedule: draft.hasVariableSchedule === "yes",
    schedule_variability:
      draft.hasVariableSchedule === "yes" ? draft.scheduleVariability : null,
  };
}
