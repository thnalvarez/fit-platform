import {
  AvoidedTrainingMethod,
  BodybuildingFocus,
  BodyRegion,
  ConsistentTrainingExperience,
  DailyPhysicalDemand,
  DetailedMusclePriority,
  Equipment,
  ExerciseWarningSign,
  MuscleGroup,
  MovementRestriction,
  PainContext,
  PreferredTrainingMethod,
  PreferredTrainingTime,
  PrimaryGoal,
  ProgramManagement,
  PregnancyStatus,
  RecentTrainingInterruption,
  ScheduleType,
  SecondaryGoal,
  TechnicalFamiliarity,
  TrainingLocation,
  Weekday,
  YesNoAnswer,
  YesNoNotSureAnswer,
} from "./types";

export type OnboardingOption<T> = {
  label: string;
  value: T;
};

export const primaryGoalOptions: OnboardingOption<PrimaryGoal>[] = [
  { label: "Perder gordura", value: "fat_loss" },
  { label: "Ganhar massa muscular", value: "muscle_gain" },
  { label: "Recomposição corporal", value: "body_recomposition" },
  { label: "Ganhar força", value: "strength" },
  { label: "Melhorar condicionamento", value: "conditioning" },
  { label: "Saúde e qualidade de vida", value: "health" },
];

export const secondaryGoalNoneOption: OnboardingOption<SecondaryGoal> = {
  label: "Nenhum objetivo secundário",
  value: "none",
};

export const dailyPhysicalDemandOptions: OnboardingOption<DailyPhysicalDemand>[] = [
  { label: "Passo a maior parte do dia sentado", value: "mostly_seated" },
  {
    label: "Passo boa parte do dia em pé ou caminhando",
    value: "mostly_standing_or_walking",
  },
  {
    label: "Meu trabalho ou rotina exige esforço físico frequente",
    value: "physically_active_work",
  },
  {
    label: "Minha rotina é fisicamente muito exigente",
    value: "very_demanding_physical_work",
  },
];

export const trainingDayCountOptions = [1, 2, 3, 4, 5, 6, 7];

export const scheduleTypeOptions: OnboardingOption<ScheduleType>[] = [
  { label: "Sim, normalmente são os mesmos", value: "fixed" },
  { label: "Não, variam de uma semana para outra", value: "variable" },
];

export const weekdayOptions: OnboardingOption<Weekday>[] = [
  { label: "Seg", value: "monday" },
  { label: "Ter", value: "tuesday" },
  { label: "Qua", value: "wednesday" },
  { label: "Qui", value: "thursday" },
  { label: "Sex", value: "friday" },
  { label: "Sáb", value: "saturday" },
  { label: "Dom", value: "sunday" },
];

export const sessionDurationOptions = [20, 30, 45, 60, 75, 90, 120];

export const preferredTrainingTimeOptions: OnboardingOption<PreferredTrainingTime>[] = [
  { label: "Manhã", value: "morning" },
  { label: "Tarde", value: "afternoon" },
  { label: "Noite", value: "evening" },
  { label: "Horário flexível", value: "flexible" },
  { label: "Sem preferência", value: "no_preference" },
];

export const consistentTrainingExperienceOptions: OnboardingOption<ConsistentTrainingExperience>[] = [
  { label: "Nunca treinei", value: "never" },
  { label: "Menos de 3 meses", value: "less_than_3_months" },
  { label: "3 a 6 meses", value: "3_to_6_months" },
  { label: "6 a 12 meses", value: "6_to_12_months" },
  { label: "1 a 2 anos", value: "1_to_2_years" },
  { label: "2 a 5 anos", value: "2_to_5_years" },
  { label: "Mais de 5 anos", value: "more_than_5_years" },
];

export const recentTrainingFrequencyOptions = [0, 1, 2, 3, 4, 5, 6, 7];

export const recentTrainingInterruptionOptions: OnboardingOption<RecentTrainingInterruption>[] = [
  { label: "Não houve interrupção relevante", value: "none" },
  { label: "Menos de 1 mês", value: "less_than_1_month" },
  { label: "1 a 3 meses", value: "1_to_3_months" },
  { label: "3 a 6 meses", value: "3_to_6_months" },
  { label: "Mais de 6 meses", value: "more_than_6_months" },
];

export const technicalFamiliarityOptions: OnboardingOption<TechnicalFamiliarity>[] = [
  { label: "Nunca pratiquei musculação", value: "none" },
  {
    label: "Conheço exercícios básicos, mas ainda preciso de orientação",
    value: "guided_basics",
  },
  {
    label: "Executo exercícios básicos com autonomia",
    value: "independent_basics",
  },
  {
    label: "Tenho boa experiência com exercícios compostos e isoladores",
    value: "broad_experience",
  },
  {
    label: "Tenho experiência ampla com treino estruturado, progressão e diferentes técnicas",
    value: "advanced_programming_familiarity",
  },
];

export const programManagementOptions: OnboardingOption<ProgramManagement>[] = [
  { label: "Personal trainer", value: "personal_trainer" },
  { label: "Treinador de bodybuilding", value: "bodybuilding_coach" },
  { label: "Outro profissional", value: "other_professional" },
  { label: "Não, eu mesmo gerencio", value: "self_managed" },
];

export const bodybuildingFocusOptions: OnboardingOption<BodybuildingFocus>[] = [
  { label: "Estética recreacional", value: "recreational_aesthetics" },
  { label: "Bodybuilding sem competição", value: "non_competitive_bodybuilding" },
  { label: "Preparação ou prática competitiva", value: "competitive_bodybuilding" },
  { label: "Não", value: "no" },
];

export const trainingLocationOptions: OnboardingOption<TrainingLocation>[] = [
  { label: "Academia completa", value: "full_gym" },
  { label: "Academia com estrutura limitada", value: "limited_gym" },
  { label: "Em casa", value: "home" },
  { label: "Ao ar livre", value: "outdoors" },
  { label: "Outro local", value: "other" },
];

export const equipmentOptions: OnboardingOption<Equipment>[] = [
  { label: "Halteres", value: "dumbbells" },
  { label: "Barra, anilhas e rack", value: "barbell_plates_rack" },
  { label: "Banco ajustável", value: "adjustable_bench" },
  { label: "Smith machine", value: "smith_machine" },
  { label: "Cabos / crossover", value: "cable_station" },
  { label: "Puxador e remada", value: "vertical_pull_and_row" },
  { label: "Leg press ou hack squat", value: "leg_press_or_hack" },
  { label: "Extensora", value: "leg_extension" },
  { label: "Flexora", value: "leg_curl" },
  { label: "Barra fixa", value: "pullup_bar" },
  { label: "Elásticos", value: "resistance_bands" },
  { label: "Kettlebells", value: "kettlebells" },
  { label: "Equipamento cardiovascular", value: "cardio_equipment" },
  { label: "Somente peso corporal", value: "bodyweight_only" },
];

export const fullGymUnavailableEquipmentOptions = equipmentOptions.filter(
  ({ value }) =>
    !["resistance_bands", "kettlebells", "bodyweight_only"].includes(value),
);

export const outdoorEquipmentOptions = equipmentOptions.filter(({ value }) =>
  [
    "pullup_bar",
    "resistance_bands",
    "kettlebells",
    "cardio_equipment",
    "bodyweight_only",
  ].includes(value),
);

export const preferredTrainingMethodOptions: OnboardingOption<PreferredTrainingMethod>[] = [
  { label: "Pesos livres", value: "free_weights" },
  { label: "Máquinas", value: "machines" },
  { label: "Exercícios com peso corporal", value: "bodyweight" },
  { label: "Circuitos e condicionamento", value: "circuits_conditioning" },
  { label: "Sem preferência", value: "no_preference" },
];

export const avoidedTrainingMethodOptions: OnboardingOption<AvoidedTrainingMethod>[] = [
  { label: "Pesos livres", value: "free_weights" },
  { label: "Máquinas", value: "machines" },
  { label: "Exercícios com peso corporal", value: "bodyweight" },
  { label: "Circuitos e condicionamento", value: "circuits_conditioning" },
  { label: "Nenhuma", value: "none" },
];

export const muscleGroupOptions: OnboardingOption<MuscleGroup>[] = [
  { label: "Peito", value: "chest" },
  { label: "Costas", value: "back" },
  { label: "Ombros", value: "shoulders" },
  { label: "Bíceps", value: "biceps" },
  { label: "Tríceps", value: "triceps" },
  { label: "Quadríceps", value: "quadriceps" },
  { label: "Posteriores de coxa", value: "hamstrings" },
  { label: "Glúteos", value: "glutes" },
  { label: "Panturrilhas", value: "calves" },
  { label: "Core", value: "core" },
  { label: "Sem prioridade específica", value: "no_specific_priority" },
];

export const detailedMusclePriorityOptions: OnboardingOption<DetailedMusclePriority>[] = [
  { label: "Peitoral superior", value: "upper_chest" },
  { label: "Largura de dorsais", value: "lat_width" },
  { label: "Espessura de costas", value: "back_thickness" },
  { label: "Deltoide lateral", value: "lateral_delts" },
  { label: "Deltoide posterior", value: "rear_delts" },
  { label: "Bíceps", value: "biceps" },
  { label: "Tríceps", value: "triceps" },
  { label: "Quadríceps", value: "quadriceps" },
  { label: "Posteriores de coxa", value: "hamstrings" },
  { label: "Glúteos", value: "glutes" },
  { label: "Panturrilhas", value: "calves" },
  { label: "Abdômen", value: "abs" },
];

export const yesNoOptions: OnboardingOption<YesNoAnswer>[] = [
  { label: "Sim", value: "yes" },
  { label: "Não", value: "no" },
];

export const yesNoNotSureOptions: OnboardingOption<YesNoNotSureAnswer>[] = [
  ...yesNoOptions,
  { label: "Não tenho certeza", value: "not_sure" },
];

export const bodyRegionOptions: OnboardingOption<BodyRegion>[] = [
  { label: "Pescoço", value: "neck" },
  { label: "Ombro", value: "shoulder" },
  { label: "Cotovelo", value: "elbow" },
  { label: "Punho ou mão", value: "wrist_hand" },
  { label: "Parte superior das costas", value: "upper_back" },
  { label: "Lombar", value: "lower_back" },
  { label: "Quadril", value: "hip" },
  { label: "Joelho", value: "knee" },
  { label: "Tornozelo ou pé", value: "ankle_foot" },
  { label: "Outra região", value: "other" },
];

export const painContextOptions: OnboardingOption<PainContext>[] = [
  { label: "Mesmo em repouso", value: "at_rest" },
  { label: "Em atividades do dia a dia", value: "during_daily_activities" },
  { label: "Durante exercícios", value: "during_exercise" },
  { label: "Depois de treinar", value: "after_exercise" },
  { label: "Somente em alguns movimentos", value: "specific_movements" },
  { label: "Não tenho certeza", value: "not_sure" },
];

export const movementRestrictionOptions: OnboardingOption<MovementRestriction>[] = [
  { label: "Agachar profundamente", value: "deep_knee_flexion" },
  { label: "Flexionar a coluna com carga", value: "loaded_spinal_flexion" },
  { label: "Empurrar peso acima da cabeça", value: "overhead_pressing" },
  { label: "Movimentos de supino/empurrar", value: "horizontal_pressing" },
  { label: "Puxadas acima da cabeça", value: "vertical_pulling" },
  { label: "Remadas", value: "horizontal_pulling" },
  { label: "Movimentos de dobrar o quadril, como terra/RDL", value: "hip_hinge" },
  { label: "Corrida", value: "running" },
  { label: "Saltos", value: "jumping" },
  { label: "Outro", value: "other" },
  { label: "Nenhum", value: "none" },
];

export const exerciseWarningSignOptions: OnboardingOption<ExerciseWarningSign>[] = [
  { label: "Desconforto, pressão ou dor no peito durante esforço", value: "chest_discomfort_with_activity" },
  { label: "Desmaio ou perda de consciência sem explicação clara", value: "unexplained_fainting" },
  { label: "Tontura importante ou sensação de desmaio durante atividade", value: "unexplained_dizziness" },
  { label: "Falta de ar fora do esperado para o esforço", value: "unusual_shortness_of_breath" },
  { label: "Palpitações acompanhadas de mal-estar, tontura ou falta de ar", value: "palpitations_with_symptoms" },
  { label: "Nenhuma dessas situações", value: "none" },
];

export const pregnancyStatusOptions: OnboardingOption<PregnancyStatus>[] = [
  { label: "Estou grávida", value: "pregnant" },
  { label: "Tive parto recentemente", value: "recent_postpartum" },
  { label: "Não", value: "no" },
  { label: "Prefiro não informar", value: "prefer_not_to_say" },
];
