export type BodyMeasurementKey =
  | "waist"
  | "hip"
  | "chest"
  | "neck"
  | "shoulders"
  | "left_arm"
  | "right_arm"
  | "left_thigh"
  | "right_thigh"
  | "left_calf"
  | "right_calf";

export type BodyMeasurementDraft = Partial<Record<BodyMeasurementKey, string>>;

export type BodyMeasurementInsert = {
  neck_cm: number | null;
  shoulders_cm: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  left_arm_cm: number | null;
  right_arm_cm: number | null;
  left_thigh_cm: number | null;
  right_thigh_cm: number | null;
  left_calf_cm: number | null;
  right_calf_cm: number | null;
};

export type MeasurementDefinition = {
  key: BodyMeasurementKey;
  label: string;
  help: string;
  minimumCm: number;
  maximumCm: number;
};

export const primaryMeasurementDefinitions: MeasurementDefinition[] = [
  {
    key: "waist",
    label: "Cintura",
    help: "Meça ao redor do abdômen na altura do umbigo, mantendo o abdômen relaxado.",
    minimumCm: 30,
    maximumCm: 200,
  },
  {
    key: "hip",
    label: "Quadril",
    help: "Meça ao redor da região mais larga dos glúteos.",
    minimumCm: 40,
    maximumCm: 220,
  },
  {
    key: "chest",
    label: "Tórax",
    help: "Meça ao redor do tórax em posição relaxada, mantendo a fita nivelada.",
    minimumCm: 40,
    maximumCm: 200,
  },
];

export const additionalMeasurementDefinitions: MeasurementDefinition[] = [
  {
    key: "neck",
    label: "Pescoço",
    help: "Meça ao redor do pescoço mantendo a fita nivelada e sem apertar.",
    minimumCm: 15,
    maximumCm: 80,
  },
  {
    key: "shoulders",
    label: "Ombros",
    help: "Meça a circunferência ao redor da região mais larga dos ombros.",
    minimumCm: 40,
    maximumCm: 200,
  },
  {
    key: "left_arm",
    label: "Braço esquerdo",
    help: "Meça no ponto de maior circunferência do braço, com o braço relaxado.",
    minimumCm: 10,
    maximumCm: 80,
  },
  {
    key: "right_arm",
    label: "Braço direito",
    help: "Meça no ponto de maior circunferência do braço, com o braço relaxado.",
    minimumCm: 10,
    maximumCm: 80,
  },
  {
    key: "left_thigh",
    label: "Coxa esquerda",
    help: "Meça no ponto definido da coxa e procure repetir exatamente o mesmo local nas próximas avaliações.",
    minimumCm: 20,
    maximumCm: 120,
  },
  {
    key: "right_thigh",
    label: "Coxa direita",
    help: "Meça no ponto definido da coxa e procure repetir exatamente o mesmo local nas próximas avaliações.",
    minimumCm: 20,
    maximumCm: 120,
  },
  {
    key: "left_calf",
    label: "Panturrilha esquerda",
    help: "Meça no ponto de maior circunferência da panturrilha.",
    minimumCm: 10,
    maximumCm: 80,
  },
  {
    key: "right_calf",
    label: "Panturrilha direita",
    help: "Meça no ponto de maior circunferência da panturrilha.",
    minimumCm: 10,
    maximumCm: 80,
  },
];

export const allMeasurementDefinitions = [
  ...primaryMeasurementDefinitions,
  ...additionalMeasurementDefinitions,
];

export function normalizeMeasurementInput(value: string) {
  return value.replace(/,/g, ".").replace(/[^0-9.]/g, "");
}

export function parseMeasurement(value: string) {
  if (!/^\d+(\.\d)?$/.test(value)) return null;
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function isMeasurementValid(
  value: string,
  definition: MeasurementDefinition,
) {
  if (!value) return true;
  const parsedValue = parseMeasurement(value);
  return (
    parsedValue !== null &&
    parsedValue >= definition.minimumCm &&
    parsedValue <= definition.maximumCm
  );
}

function parseDraftValue(draft: BodyMeasurementDraft, key: BodyMeasurementKey) {
  const value = draft[key]?.trim() ?? "";

  if (!value) return null;

  const parsedValue = parseMeasurement(value);

  if (parsedValue === null) {
    throw new Error("Invalid body measurement draft.");
  }

  return parsedValue;
}

export function buildBodyMeasurementInsert(
  draft: BodyMeasurementDraft,
): BodyMeasurementInsert | null {
  const measurement: BodyMeasurementInsert = {
    neck_cm: parseDraftValue(draft, "neck"),
    shoulders_cm: parseDraftValue(draft, "shoulders"),
    chest_cm: parseDraftValue(draft, "chest"),
    waist_cm: parseDraftValue(draft, "waist"),
    hip_cm: parseDraftValue(draft, "hip"),
    left_arm_cm: parseDraftValue(draft, "left_arm"),
    right_arm_cm: parseDraftValue(draft, "right_arm"),
    left_thigh_cm: parseDraftValue(draft, "left_thigh"),
    right_thigh_cm: parseDraftValue(draft, "right_thigh"),
    left_calf_cm: parseDraftValue(draft, "left_calf"),
    right_calf_cm: parseDraftValue(draft, "right_calf"),
  };

  return Object.values(measurement).some((value) => value !== null)
    ? measurement
    : null;
}
