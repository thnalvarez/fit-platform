import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { OnboardingHeader } from "../../components/onboarding/OnboardingHeader";
import { SelectableCard } from "../../components/onboarding/SelectableCard";
import { SelectableChip } from "../../components/onboarding/SelectableChip";
import { StatusMessage } from "../../components/onboarding/StatusMessage";
import { Button } from "../../components/ui/Button";
import {
  equipmentOptions,
  fullGymUnavailableEquipmentOptions,
  outdoorEquipmentOptions,
  trainingLocationOptions,
} from "../../features/onboarding/options";
import { saveTrainingLocation } from "../../features/onboarding/persistence";
import { Equipment, TrainingLocation } from "../../features/onboarding/types";
import { colors, spacing, typography } from "../../theme";

export default function TrainingLocationScreen() {
  const params = useLocalSearchParams<{
    primaryGoal?: string;
    technicalFamiliarity?: string;
    bodybuildingFocus?: string;
  }>();
  const [trainingLocation, setTrainingLocation] = useState<TrainingLocation | null>(null);
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([]);
  const [unavailableGymEquipment, setUnavailableGymEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requiresAvailableEquipment = trainingLocation !== null && trainingLocation !== "full_gym";
  const isComplete =
    trainingLocation !== null &&
    (!requiresAvailableEquipment || availableEquipment.length > 0);
  const visibleEquipmentOptions =
    trainingLocation === "outdoors" ? outdoorEquipmentOptions : equipmentOptions;

  function handleLocation(value: TrainingLocation) {
    setTrainingLocation(value);
    setAvailableEquipment([]);
    setUnavailableGymEquipment([]);
    setErrorMessage(null);
  }

  function toggleAvailableEquipment(value: Equipment) {
    setErrorMessage(null);
    setAvailableEquipment((current) => {
      if (value === "bodyweight_only") {
        return current.includes(value) ? [] : [value];
      }
      const withoutBodyweightOnly = current.filter((equipment) => equipment !== "bodyweight_only");
      return withoutBodyweightOnly.includes(value)
        ? withoutBodyweightOnly.filter((equipment) => equipment !== value)
        : [...withoutBodyweightOnly, value];
    });
  }

  function toggleUnavailableEquipment(value: Equipment) {
    setUnavailableGymEquipment((current) =>
      current.includes(value)
        ? current.filter((equipment) => equipment !== value)
        : [...current, value],
    );
  }

  async function handleContinue() {
    if (loading) return;

    setErrorMessage(null);
    if (!trainingLocation) {
      setErrorMessage("Selecione onde você treina.");
      return;
    }
    if (requiresAvailableEquipment && availableEquipment.length === 0) {
      setErrorMessage("Selecione pelo menos uma estrutura disponível.");
      return;
    }

    try {
      setLoading(true);
      await saveTrainingLocation({
        training_location: trainingLocation,
        available_equipment:
          trainingLocation === "full_gym" ? null : availableEquipment,
        unavailable_gym_equipment:
          trainingLocation === "full_gym" && unavailableGymEquipment.length > 0
            ? unavailableGymEquipment
            : null,
      });
      router.push({ pathname: "/(onboarding)/preferences", params });
    } catch (error) {
      console.error("[TRAINING LOCATION] Unexpected error while saving", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado ao salvar seu local de treino.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <OnboardingHeader step={5} title="Onde você treina?" />

        <View style={styles.cardList}>
          {trainingLocationOptions.map((option) => (
            <SelectableCard key={option.value} label={option.label} selected={trainingLocation === option.value} onPress={() => handleLocation(option.value)} />
          ))}
        </View>

        {trainingLocation === "full_gym" ? (
          <View style={styles.section}>
            <Text style={styles.label}>Existe alguma estrutura importante que NÃO está disponível?</Text>
            <Text style={styles.helper}>Opcional. Marque apenas as ausências.</Text>
            <View style={styles.chipList}>
              {fullGymUnavailableEquipmentOptions.map((option) => (
                <SelectableChip key={option.value} label={option.label} selected={unavailableGymEquipment.includes(option.value)} onPress={() => toggleUnavailableEquipment(option.value)} />
              ))}
            </View>
          </View>
        ) : null}

        {requiresAvailableEquipment ? (
          <View style={styles.section}>
            <Text style={styles.label}>Quais estruturas você realmente possui?</Text>
            <Text style={styles.helper}>Selecione tudo o que você pode usar.</Text>
            <View style={styles.chipList}>
              {visibleEquipmentOptions.map((option) => (
                <SelectableChip key={option.value} label={option.label} selected={availableEquipment.includes(option.value)} onPress={() => toggleAvailableEquipment(option.value)} />
              ))}
            </View>
          </View>
        ) : null}

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
  cardList: { gap: spacing.sm },
  chipList: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
