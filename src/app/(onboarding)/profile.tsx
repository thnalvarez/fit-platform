import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Button } from "../../components/ui/Button";
import { BiologicalSex } from "../../features/onboarding/types";
import { supabase } from "../../services/supabase";
import { colors, spacing, typography } from "../../theme";

const MINIMUM_AGE = 13;
const MAXIMUM_AGE = 100;
const MINIMUM_HEIGHT_CM = 120;
const MAXIMUM_HEIGHT_CM = 230;
const MINIMUM_WEIGHT_KG = 30;
const MAXIMUM_WEIGHT_KG = 300;

export default function Onboarding() {
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [webBirthDate, setWebBirthDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [sex, setSex] = useState<BiologicalSex | null>(null);

  const [heightMeters, setHeightMeters] = useState<number | null>(null);
  const [heightCentimeters, setHeightCentimeters] = useState<number | null>(null);

  const [weightKg, setWeightKg] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function formatDate(date: Date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  function formatDateForDatabase(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function handleWebBirthDate(text: string) {
    const numbers = text.replace(/\D/g, "").slice(0, 8);

    let formatted = numbers;

    if (numbers.length > 2) {
      formatted = `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    }

    if (numbers.length > 4) {
      formatted = `${numbers.slice(0, 2)}/${numbers.slice(
        2,
        4,
      )}/${numbers.slice(4)}`;
    }

    setWebBirthDate(formatted);
  }

  function parseWebBirthDate() {
    const parts = webBirthDate.split("/");

    if (parts.length !== 3) {
      return null;
    }

    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);

    if (!day || !month || !year) {
      return null;
    }

    if (year < 1900) {
      return null;
    }

    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === "dismissed") {
      return;
    }

    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  }

  async function handleContinue() {
    if (loading) return;

    setErrorMessage(null);

    const finalBirthDate =
      Platform.OS === "web" ? parseWebBirthDate() : birthDate;

    if (!finalBirthDate) {
      setErrorMessage("Informe uma data de nascimento válida.");
      return;
    }

    const today = new Date();

    if (finalBirthDate > today) {
      setErrorMessage("A data de nascimento não pode estar no futuro.");
      return;
    }

    const minimumBirthDate = new Date(
      today.getFullYear() - MINIMUM_AGE,
      today.getMonth(),
      today.getDate(),
    );
    const maximumBirthDate = new Date(
      today.getFullYear() - MAXIMUM_AGE - 1,
      today.getMonth(),
      today.getDate() + 1,
    );

    if (finalBirthDate > minimumBirthDate || finalBirthDate < maximumBirthDate) {
      setErrorMessage(
        `A idade informada deve estar entre ${MINIMUM_AGE} e ${MAXIMUM_AGE} anos.`,
      );
      return;
    }

    if (!sex) {
      setErrorMessage("Selecione uma opção para sexo biológico.");
      return;
    }

    if (heightMeters === null || heightCentimeters === null) {
      setErrorMessage("Confirme sua altura antes de continuar.");
      return;
    }

    const heightCm = heightMeters * 100 + heightCentimeters;

    if (heightCm < MINIMUM_HEIGHT_CM || heightCm > MAXIMUM_HEIGHT_CM) {
      setErrorMessage(
        `Informe uma altura entre ${MINIMUM_HEIGHT_CM} e ${MAXIMUM_HEIGHT_CM} cm.`,
      );
      return;
    }

    if (
      weightKg === null ||
      weightKg < MINIMUM_WEIGHT_KG ||
      weightKg > MAXIMUM_WEIGHT_KG
    ) {
      setErrorMessage(
        `Informe um peso entre ${MINIMUM_WEIGHT_KG} e ${MAXIMUM_WEIGHT_KG} kg.`,
      );
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("[PROFILE] Failed to get authenticated user", userError);
        setErrorMessage(
          "Não foi possível identificar sua conta. Entre novamente e tente de novo.",
        );

        return;
      }

      const profileValues: Record<string, unknown> = {
        birth_date: formatDateForDatabase(finalBirthDate),
        sex,
        height_cm: heightCm,
        weight_kg: weightKg,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("profiles")
        .update(profileValues)
        .eq("id", user.id)
        .select("id");

      if (error) {
        console.error("[PROFILE] Profile update failed", error);
        setErrorMessage("Não foi possível salvar seus dados. Tente novamente.");
        return;
      }

      if (!data || data.length === 0) {
        console.error("[PROFILE] Profile update returned no rows", {
          userId: user.id,
        });

        setErrorMessage(
          "Seu perfil não pôde ser encontrado ou atualizado.",
        );

        return;
      }

      router.push("/goal");
    } catch (error) {
      console.error("[PROFILE] Unexpected error while saving", error);

      setErrorMessage("Ocorreu um erro inesperado ao salvar seus dados.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text style={styles.step}>ETAPA 1 DE 12</Text>

          <Text style={styles.title}>Sobre você</Text>

          <Text style={styles.description}>
            Essas informações ajudam a personalizar seu acompanhamento.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Data de nascimento</Text>

          {Platform.OS === "web" ? (
            <TextInput
              value={webBirthDate}
              onChangeText={handleWebBirthDate}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.secondary}
              keyboardType="numeric"
              maxLength={10}
              style={styles.input}
            />
          ) : (
            <>
              <Pressable
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={birthDate ? styles.inputText : styles.placeholder}>
                  {birthDate ? formatDate(birthDate) : "Selecionar data"}
                </Text>
              </Pressable>

              {showDatePicker && (
                <DateTimePicker
                  value={birthDate ?? new Date(2000, 0, 1)}
                  mode="date"
                  maximumDate={new Date()}
                  onChange={handleDateChange}
                />
              )}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Sexo biológico</Text>
          <Text style={styles.helper}>
            Usado apenas quando necessário para cálculos fisiológicos e
            nutricionais. Não define seu tipo de treino.
          </Text>

          <View style={styles.sexRow}>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: sex === "male" }}
              style={[styles.option, sex === "male" && styles.optionSelected]}
              onPress={() => setSex("male")}
            >
              <Text
                style={[
                  styles.optionText,
                  sex === "male" && styles.optionTextSelected,
                ]}
              >
                Masculino
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: sex === "female" }}
              style={[styles.option, sex === "female" && styles.optionSelected]}
              onPress={() => setSex("female")}
            >
              <Text
                style={[
                  styles.optionText,
                  sex === "female" && styles.optionTextSelected,
                ]}
              >
                Feminino
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: sex === "prefer_not_to_say" }}
              style={[
                styles.option,
                sex === "prefer_not_to_say" && styles.optionSelected,
              ]}
              onPress={() => setSex("prefer_not_to_say")}
            >
              <Text
                style={[
                  styles.optionText,
                  sex === "prefer_not_to_say" && styles.optionTextSelected,
                ]}
              >
                Prefiro não informar
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Altura</Text>

          <View style={styles.pickerRow}>
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={heightMeters}
                onValueChange={(value) => setHeightMeters(Number(value))}
                style={styles.picker}
              >
                <Picker.Item label="Metros" value={null} />
                <Picker.Item label="1 m" value={1} />

                <Picker.Item label="2 m" value={2} />
              </Picker>
            </View>

            <View style={styles.pickerBox}>
              <Picker
                selectedValue={heightCentimeters}
                onValueChange={(value) => setHeightCentimeters(Number(value))}
                style={styles.picker}
              >
                <Picker.Item label="Centímetros" value={null} />
                {Array.from({ length: 100 }, (_, value) => (
                  <Picker.Item
                    key={value}
                    label={`${value} cm`}
                    value={value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <Text style={styles.measurementPreview}>
            {heightMeters !== null && heightCentimeters !== null
              ? `${heightMeters} m ${heightCentimeters} cm`
              : "Selecione metros e centímetros"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Peso</Text>

          <View style={styles.pickerBox}>
            <Picker
              selectedValue={weightKg}
              onValueChange={(value) => setWeightKg(Number(value))}
              style={styles.picker}
            >
              <Picker.Item label="Selecionar peso" value={null} />
              {Array.from({ length: 271 }, (_, index) => {
                const value = index + 30;

                return (
                  <Picker.Item
                    key={value}
                    label={`${value} kg`}
                    value={value}
                  />
                );
              })}
            </Picker>
          </View>

          <Text style={styles.measurementPreview}>
            {weightKg !== null ? `${weightKg} kg` : "Selecione seu peso"}
          </Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <Button title="Continuar" loading={loading} onPress={handleContinue} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.xl,
  },

  step: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },

  title: {
    color: colors.primary,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },

  description: {
    color: colors.secondary,
    fontSize: typography.fontSize.md,
    lineHeight: 24,
    marginTop: spacing.md,
  },

  section: {
    gap: spacing.sm,
  },

  label: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  input: {
    minHeight: 56,
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    color: colors.primary,
    fontSize: typography.fontSize.md,
  },

  inputText: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
  },

  placeholder: {
    color: colors.secondary,
    fontSize: typography.fontSize.md,
  },

  sexRow: {
    flexDirection: "column",
    gap: spacing.md,
  },

  option: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceSecondary,
  },

  optionText: {
    color: colors.secondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },

  optionTextSelected: {
    color: colors.primary,
  },

  pickerRow: {
    flexDirection: "row",
    gap: spacing.md,
  },

  pickerBox: {
    flex: 1,
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },

  picker: {
    color: colors.primary,
    backgroundColor: colors.surface,
    fontSize: typography.fontSize.md,
  },

  measurementPreview: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },

  helper: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },

  errorBox: {
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.surface,
  },

  errorText: {
    color: colors.danger,
    fontSize: typography.fontSize.md,
    lineHeight: 22,
  },
});
