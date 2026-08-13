import {
  BodyRegion,
  ExerciseWarningSign,
  LimitationsProfileUpdate,
  MovementRestriction,
  PainContext,
  PregnancyStatus,
  YesNoAnswer,
  YesNoNotSureAnswer,
} from "./types";

type LimitationsAnswers = {
  currentPain: YesNoAnswer;
  painRegions: BodyRegion[];
  painContexts: PainContext[];
  relevantInjuryHistory: YesNoAnswer;
  injuryRegions: BodyRegion[];
  restrictionStatus: YesNoNotSureAnswer | null;
  movementRestrictions: MovementRestriction[];
  exerciseWarningSigns: ExerciseWarningSign[];
  exerciseLimit: YesNoNotSureAnswer;
  hasClearGuidance: boolean | null;
  pregnancyStatus: PregnancyStatus | null;
};

export function buildLimitationsProfileUpdate(
  answers: LimitationsAnswers,
): {
  profileUpdate: LimitationsProfileUpdate;
  hasKnownExerciseRestrictions: boolean;
} {
  const hasCurrentPain = answers.currentPain === "yes";
  const hasRelevantInjuryHistory = answers.relevantInjuryHistory === "yes";
  const hasExerciseWarningSigns = answers.exerciseWarningSigns.some(
    (sign) => sign !== "none",
  );
  const hasMovementRestrictions = answers.movementRestrictions.some(
    (restriction) => restriction !== "none",
  );
  const hasKnownExerciseRestrictions =
    hasMovementRestrictions ||
    (answers.restrictionStatus !== null && answers.restrictionStatus !== "no") ||
    answers.exerciseLimit !== "no";
  const safetyClearanceRequired =
    hasExerciseWarningSigns ||
    (answers.exerciseLimit !== "no" && answers.hasClearGuidance === false);
  const requiresSpecialPopulationProgramming =
    answers.pregnancyStatus === "pregnant" ||
    answers.pregnancyStatus === "recent_postpartum";

  return {
    profileUpdate: {
      has_current_pain: hasCurrentPain,
      pain_regions: hasCurrentPain ? answers.painRegions : null,
      pain_contexts: hasCurrentPain ? answers.painContexts : null,
      has_relevant_injury_history: hasRelevantInjuryHistory,
      injury_regions: hasRelevantInjuryHistory ? answers.injuryRegions : null,
      health_professional_restriction_status: hasRelevantInjuryHistory
        ? answers.restrictionStatus
        : null,
      movement_restrictions:
        answers.movementRestrictions.length > 0
          ? answers.movementRestrictions
          : null,
      exercise_warning_signs: answers.exerciseWarningSigns,
      has_exercise_warning_signs: hasExerciseWarningSigns,
      health_professional_exercise_limit: answers.exerciseLimit,
      has_clear_exercise_guidance:
        answers.exerciseLimit === "no" ? null : answers.hasClearGuidance,
      pregnancy_status: answers.pregnancyStatus,
      safety_clearance_required: safetyClearanceRequired,
      requires_special_population_programming:
        requiresSpecialPopulationProgramming,
    },
    hasKnownExerciseRestrictions,
  };
}
