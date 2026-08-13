export type PrimaryGoal =
  | "fat_loss"
  | "muscle_gain"
  | "body_recomposition"
  | "strength"
  | "conditioning"
  | "health";

export type SecondaryGoal = PrimaryGoal | "none";

export type BiologicalSex = "male" | "female" | "prefer_not_to_say";

export type DailyPhysicalDemand =
  | "mostly_seated"
  | "mostly_standing_or_walking"
  | "physically_active_work"
  | "very_demanding_physical_work";

export type ScheduleType = "fixed" | "variable";

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type PreferredTrainingTime =
  | "morning"
  | "afternoon"
  | "evening"
  | "flexible"
  | "no_preference";

export type ConsistentTrainingExperience =
  | "never"
  | "less_than_3_months"
  | "3_to_6_months"
  | "6_to_12_months"
  | "1_to_2_years"
  | "2_to_5_years"
  | "more_than_5_years";

export type RecentTrainingInterruption =
  | "none"
  | "less_than_1_month"
  | "1_to_3_months"
  | "3_to_6_months"
  | "more_than_6_months";

export type TechnicalFamiliarity =
  | "none"
  | "guided_basics"
  | "independent_basics"
  | "broad_experience"
  | "advanced_programming_familiarity";

export type ProgramManagement =
  | "personal_trainer"
  | "bodybuilding_coach"
  | "other_professional"
  | "self_managed";

export type BodybuildingFocus =
  | "recreational_aesthetics"
  | "non_competitive_bodybuilding"
  | "competitive_bodybuilding"
  | "no";

export type TrainingLocation =
  | "full_gym"
  | "limited_gym"
  | "home"
  | "outdoors"
  | "other";

export type Equipment =
  | "dumbbells"
  | "barbell_plates_rack"
  | "adjustable_bench"
  | "smith_machine"
  | "cable_station"
  | "vertical_pull_and_row"
  | "leg_press_or_hack"
  | "leg_extension"
  | "leg_curl"
  | "pullup_bar"
  | "resistance_bands"
  | "kettlebells"
  | "cardio_equipment"
  | "bodyweight_only";

export type TrainingMethod =
  | "free_weights"
  | "machines"
  | "bodyweight"
  | "circuits_conditioning";

export type PreferredTrainingMethod = TrainingMethod | "no_preference";
export type AvoidedTrainingMethod = TrainingMethod | "none";

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "quadriceps"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "core"
  | "no_specific_priority";

export type DetailedMusclePriority =
  | "upper_chest"
  | "lat_width"
  | "back_thickness"
  | "lateral_delts"
  | "rear_delts"
  | "biceps"
  | "triceps"
  | "quadriceps"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "abs";

export type RoutineProfileUpdate = {
  daily_physical_demand: DailyPhysicalDemand;
  training_days_per_week: number;
  schedule_type: ScheduleType;
  available_training_days: Weekday[] | null;
  session_duration_minutes: number;
  preferred_training_time: PreferredTrainingTime | null;
};

export type ExperienceProfileUpdate = {
  consistent_training_experience: ConsistentTrainingExperience;
  recent_training_frequency: number;
  recent_training_interruption: RecentTrainingInterruption | null;
  technical_familiarity: TechnicalFamiliarity;
  follows_structured_program: boolean;
  program_management: ProgramManagement | null;
  bodybuilding_focus: BodybuildingFocus | null;
};

export type TrainingLocationProfileUpdate = {
  training_location: TrainingLocation;
  available_equipment: Equipment[] | null;
  unavailable_gym_equipment: Equipment[] | null;
};

export type PreferencesProfileUpdate = {
  preferred_training_methods: PreferredTrainingMethod[] | null;
  avoided_training_methods: AvoidedTrainingMethod[] | null;
  priority_muscle_groups: MuscleGroup[] | null;
  detailed_muscle_priorities: DetailedMusclePriority[] | null;
};

export type YesNoAnswer = "yes" | "no";
export type YesNoNotSureAnswer = YesNoAnswer | "not_sure";

export type BodyRegion =
  | "neck"
  | "shoulder"
  | "elbow"
  | "wrist_hand"
  | "upper_back"
  | "lower_back"
  | "hip"
  | "knee"
  | "ankle_foot"
  | "other";

export type PainContext =
  | "at_rest"
  | "during_daily_activities"
  | "during_exercise"
  | "after_exercise"
  | "specific_movements"
  | "not_sure";

export type MovementRestriction =
  | "deep_knee_flexion"
  | "loaded_spinal_flexion"
  | "overhead_pressing"
  | "horizontal_pressing"
  | "vertical_pulling"
  | "horizontal_pulling"
  | "hip_hinge"
  | "running"
  | "jumping"
  | "other"
  | "none";

export type ExerciseWarningSign =
  | "chest_discomfort_with_activity"
  | "unexplained_fainting"
  | "unexplained_dizziness"
  | "unusual_shortness_of_breath"
  | "palpitations_with_symptoms"
  | "none";

export type PregnancyStatus =
  | "pregnant"
  | "recent_postpartum"
  | "no"
  | "prefer_not_to_say";

export type LimitationsProfileUpdate = {
  has_current_pain: boolean;
  pain_regions: BodyRegion[] | null;
  pain_contexts: PainContext[] | null;
  has_relevant_injury_history: boolean;
  injury_regions: BodyRegion[] | null;
  health_professional_restriction_status: YesNoNotSureAnswer | null;
  movement_restrictions: MovementRestriction[] | null;
  exercise_warning_signs: ExerciseWarningSign[];
  has_exercise_warning_signs: boolean;
  health_professional_exercise_limit: YesNoNotSureAnswer;
  has_clear_exercise_guidance: boolean | null;
  pregnancy_status: PregnancyStatus | null;
  safety_clearance_required: boolean;
  requires_special_population_programming: boolean;
};

export type SleepDurationRange =
  | "less_than_5"
  | "5_to_6"
  | "6_to_7"
  | "7_to_8"
  | "8_to_9"
  | "more_than_9";

export type SleepQuality = "very_poor" | "poor" | "fair" | "good" | "very_good";

export type SleepRegularity = "regular" | "somewhat_variable" | "very_variable";

export type PerceivedStress = "low" | "moderate" | "high" | "very_high";

export type PerceivedRecovery = "poor" | "fair" | "good" | "very_good";

export type DailyEnergyLevel =
  | "very_low"
  | "low"
  | "normal"
  | "high"
  | "very_high";

export type ScheduleVariability = "most_weeks" | "sometimes" | "rarely";

export type RecoveryProfileUpdate = {
  sleep_duration_range: SleepDurationRange;
  sleep_quality: SleepQuality;
  sleep_regularity: SleepRegularity;
  perceived_stress: PerceivedStress;
  perceived_recovery: PerceivedRecovery;
  daily_energy_level: DailyEnergyLevel;
  has_variable_schedule: boolean;
  schedule_variability: ScheduleVariability | null;
};
