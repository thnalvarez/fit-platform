import { useRef, useState } from "react";
import { router } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { OnboardingHeader } from "../../components/onboarding/OnboardingHeader";
import { StatusMessage } from "../../components/onboarding/StatusMessage";
import { Button } from "../../components/ui/Button";
import {
  additionalMeasurementDefinitions,
  allMeasurementDefinitions,
  buildBodyMeasurementInsert,
  BodyMeasurementDraft,
  BodyMeasurementKey,
  isMeasurementValid,
  MeasurementDefinition,
  normalizeMeasurementInput,
  primaryMeasurementDefinitions,
} from "../../features/onboarding/measurements";
import { saveBodyMeasurement } from "../../features/onboarding/persistence";
import { colors, spacing, typography } from "../../theme";

type CompletionType = "saved" | "skipped";

export default function MeasurementsScreen() {
  const saveInProgressRef = useRef(false);
  const [measurements, setMeasurements] = useState<BodyMeasurementDraft>({});
  const [showInstructions, setShowInstructions] = useState(false);
  const [showAdditionalMeasurements, setShowAdditionalMeasurements] =
    useState(false);
  const [openHelp, setOpenHelp] = useState<BodyMeasurementKey | null>(null);
  const [completionType, setCompletionType] =
    useState<CompletionType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const visibleDefinitions = showAdditionalMeasurements
    ? [...primaryMeasurementDefinitions, ...additionalMeasurementDefinitions]
    : primaryMeasurementDefinitions;
  const invalidKeys = allMeasurementDefinitions
    .filter((definition) =>
      !isMeasurementValid(measurements[definition.key] ?? "", definition),
    )
    .map((definition) => definition.key);
  const canContinue = invalidKeys.length === 0;

  function handleMeasurementChange(key: BodyMeasurementKey, value: string) {
    const normalizedValue = normalizeMeasurementInput(value);
    setMeasurements((current) => ({ ...current, [key]: normalizedValue }));
  }

  async function handleContinue() {
    if (saveInProgressRef.current) return;

    setErrorMessage(null);

    if (!canContinue) {
      setErrorMessage("Confira os valores informados antes de continuar.");
      return;
    }

    const measurement = buildBodyMeasurementInsert(measurements);

    if (!measurement) {
      setCompletionType("skipped");
      return;
    }

    saveInProgressRef.current = true;
    setIsSaving(true);

    try {
      await saveBodyMeasurement(measurement);
      setCompletionType("saved");
    } catch (error) {
      console.error(
        "[ONBOARDING] body measurements: unable to complete step",
        error,
      );
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar suas medidas. Tente novamente.",
      );
    } finally {
      saveInProgressRef.current = false;
      setIsSaving(false);
    }
  }

  if (completionType) {
    const skipped = completionType === "skipped";

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completedContent}>
          <StatusMessage
            variant="success"
            message={skipped ? "Etapa concluída" : "Medidas registradas"}
          />
          <Text style={styles.completionDescription}>
            {skipped
              ? "Você poderá adicionar suas medidas depois."
              : "Essa avaliação será usada como ponto de partida para acompanhar sua evolução."}
          </Text>
          <Text style={styles.nextStep}>
            Próxima etapa: hábitos e recuperação
          </Text>
          <Button
            title="Continuar"
            onPress={() => router.push("/(onboarding)/recovery")}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <OnboardingHeader
          step={8}
          title="Medidas corporais"
          description="Se quiser, registre algumas medidas para acompanhar mudanças no seu corpo ao longo do tempo."
        />

        <StatusMessage
          variant="info"
          message="Essa etapa é opcional. Você poderá adicionar ou atualizar suas medidas depois."
        />

        <View style={styles.introduction}>
          <Text style={styles.introductionText}>
            Para comparar sua evolução, tente medir sempre nas mesmas condições
            e no mesmo ponto do corpo.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: showInstructions }}
            onPress={() => setShowInstructions((current) => !current)}
            style={({ pressed }) => [
              styles.informationButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.informationButtonText}>
              Como medir corretamente?
            </Text>
          </Pressable>

          {showInstructions ? (
            <View style={styles.instructions}>
              <Text style={styles.instruction}>• Use uma fita métrica flexível.</Text>
              <Text style={styles.instruction}>
                • Mantenha a fita ajustada ao corpo sem apertar.
              </Text>
              <Text style={styles.instruction}>• Mantenha postura natural.</Text>
              <Text style={styles.instruction}>
                • Evite contrair o músculo, salvo quando indicado.
              </Text>
              <Text style={styles.instruction}>
                • Repita o mesmo ponto e condições nas próximas avaliações.
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.measurementsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Qual medida você gostaria de registrar?
            </Text>
            <Text style={styles.sectionHelper}>
              Preencha somente o que desejar. Os valores são em centímetros.
            </Text>
          </View>

          {visibleDefinitions.map((definition) => (
            <MeasurementField
              key={definition.key}
              definition={definition}
              value={measurements[definition.key] ?? ""}
              invalid={invalidKeys.includes(definition.key)}
              helpVisible={openHelp === definition.key}
              onChangeText={(value) =>
                handleMeasurementChange(definition.key, value)
              }
              onToggleHelp={() =>
                setOpenHelp((current) =>
                  current === definition.key ? null : definition.key,
                )
              }
            />
          ))}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: showAdditionalMeasurements }}
            onPress={() =>
              setShowAdditionalMeasurements((current) => !current)
            }
            style={({ pressed }) => [
              styles.addMoreButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.addMoreButtonText}>
              {showAdditionalMeasurements
                ? "− Mostrar menos medidas"
                : "+ Adicionar mais medidas"}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.principle}>
          Medidas são ferramentas de acompanhamento, não julgamento.
        </Text>

        {errorMessage ? (
          <StatusMessage variant="error" message={errorMessage} />
        ) : null}

        <Button
          title="Continuar"
          disabled={!canContinue}
          loading={isSaving}
          onPress={handleContinue}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function MeasurementField({
  definition,
  value,
  invalid,
  helpVisible,
  onChangeText,
  onToggleHelp,
}: {
  definition: MeasurementDefinition;
  value: string;
  invalid: boolean;
  helpVisible: boolean;
  onChangeText: (value: string) => void;
  onToggleHelp: () => void;
}) {
  return (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldHeader}>
        <Text style={styles.fieldLabel}>{definition.label}</Text>
        <Pressable
          accessibilityLabel={`Como medir ${definition.label.toLowerCase()}`}
          accessibilityRole="button"
          accessibilityState={{ expanded: helpVisible }}
          onPress={onToggleHelp}
          hitSlop={8}
          style={({ pressed }) => [
            styles.helpButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.helpButtonText}>?</Text>
        </Pressable>
      </View>

      <View style={[styles.inputRow, invalid && styles.inputRowInvalid]}>
        <TextInput
          accessibilityLabel={`${definition.label} em centímetros`}
          inputMode="decimal"
          keyboardType="decimal-pad"
          maxLength={6}
          onChangeText={onChangeText}
          placeholder="0.0"
          placeholderTextColor={colors.secondary}
          style={styles.input}
          value={value}
        />
        <Text style={styles.unit}>cm</Text>
      </View>

      {helpVisible ? (
        <Text style={styles.helpText}>
          {definition.help}
        </Text>
      ) : null}
      {invalid ? (
        <Text accessibilityLiveRegion="polite" style={styles.errorText}>
          Confira o valor informado.
        </Text>
      ) : null}
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
  completionDescription: {
    color: colors.secondary,
    fontSize: typography.fontSize.md,
    lineHeight: 22,
    textAlign: "center",
  },
  nextStep: {
    color: colors.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    textAlign: "center",
  },
  introduction: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  introductionText: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    lineHeight: 23,
  },
  informationButton: { minHeight: 44, justifyContent: "center" },
  informationButtonText: {
    color: colors.accent,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  instructions: { gap: spacing.sm },
  instruction: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  measurementsSection: { gap: spacing.lg },
  sectionHeader: { gap: spacing.sm },
  sectionTitle: {
    color: colors.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  sectionHelper: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  fieldContainer: { gap: spacing.sm },
  fieldHeader: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldLabel: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  helpButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  helpButtonText: {
    color: colors.accent,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  inputRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  inputRowInvalid: { borderColor: colors.danger },
  input: {
    flex: 1,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    color: colors.primary,
    fontSize: typography.fontSize.lg,
  },
  unit: {
    paddingHorizontal: spacing.md,
    color: colors.secondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  helpText: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  addMoreButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  addMoreButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  principle: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    fontStyle: "italic",
    lineHeight: 20,
    textAlign: "center",
  },
  pressed: { opacity: 0.75 },
});
