import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { OnboardingHeader } from "../../components/onboarding/OnboardingHeader";
import { SelectableCard } from "../../components/onboarding/SelectableCard";
import { SelectableChip } from "../../components/onboarding/SelectableChip";
import { StatusMessage } from "../../components/onboarding/StatusMessage";
import { Button } from "../../components/ui/Button";
import { buildLimitationsProfileUpdate } from "../../features/onboarding/limitations";
import {
  bodyRegionOptions,
  exerciseWarningSignOptions,
  movementRestrictionOptions,
  painContextOptions,
  pregnancyStatusOptions,
  yesNoNotSureOptions,
  yesNoOptions,
} from "../../features/onboarding/options";
import {
  loadAuthenticatedProfileSex,
  saveLimitations,
} from "../../features/onboarding/persistence";
import {
  BiologicalSex,
  BodyRegion,
  ExerciseWarningSign,
  MovementRestriction,
  PainContext,
  PregnancyStatus,
  YesNoAnswer,
  YesNoNotSureAnswer,
} from "../../features/onboarding/types";
import { colors, spacing, typography } from "../../theme";

export default function LimitationsScreen() {
  const [biologicalSex, setBiologicalSex] = useState<BiologicalSex | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [currentPain, setCurrentPain] = useState<YesNoAnswer | null>(null);
  const [painRegions, setPainRegions] = useState<BodyRegion[]>([]);
  const [painContexts, setPainContexts] = useState<PainContext[]>([]);
  const [relevantInjuryHistory, setRelevantInjuryHistory] = useState<YesNoAnswer | null>(null);
  const [injuryRegions, setInjuryRegions] = useState<BodyRegion[]>([]);
  const [restrictionStatus, setRestrictionStatus] = useState<YesNoNotSureAnswer | null>(null);
  const [movementRestrictions, setMovementRestrictions] = useState<MovementRestriction[]>([]);
  const [exerciseWarningSigns, setExerciseWarningSigns] = useState<ExerciseWarningSign[]>([]);
  const [exerciseLimit, setExerciseLimit] = useState<YesNoNotSureAnswer | null>(null);
  const [hasClearGuidance, setHasClearGuidance] = useState<boolean | null>(null);
  const [pregnancyStatus, setPregnancyStatus] = useState<PregnancyStatus | null>(null);
  const [profileErrorMessage, setProfileErrorMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [savedSafetyClearanceRequired, setSavedSafetyClearanceRequired] =
    useState(false);
  const [savedSpecialPopulationProgramming, setSavedSpecialPopulationProgramming] =
    useState(false);

  const showsPregnancyQuestion = biologicalSex === "female";
  const hasWarningSigns = exerciseWarningSigns.some((value) => value !== "none");
  const requiresSpecialPopulationProgramming =
    pregnancyStatus === "pregnant" || pregnancyStatus === "recent_postpartum";
  const requiresPainDetails = currentPain === "yes";
  const requiresInjuryDetails = relevantInjuryHistory === "yes";
  const requiresGuidanceAnswer = exerciseLimit === "yes" || exerciseLimit === "not_sure";
  const safetyClearanceRequired =
    hasWarningSigns ||
    (requiresGuidanceAnswer && hasClearGuidance === false);

  const isComplete =
    !profileLoading &&
    biologicalSex !== null &&
    currentPain !== null &&
    (!requiresPainDetails || (painRegions.length > 0 && painContexts.length > 0)) &&
    relevantInjuryHistory !== null &&
    (!requiresInjuryDetails || (injuryRegions.length > 0 && restrictionStatus !== null)) &&
    exerciseWarningSigns.length > 0 &&
    exerciseLimit !== null &&
    (!requiresGuidanceAnswer || hasClearGuidance !== null) &&
    (!showsPregnancyQuestion || pregnancyStatus !== null);

  useEffect(() => {
    let active = true;

    async function loadProfileSex() {
      try {
        const value = await loadAuthenticatedProfileSex();
        if (active) setBiologicalSex(value);
      } catch (error) {
        console.error("[LIMITATIONS] Failed to load profile context", error);
        if (active) {
          setProfileErrorMessage(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar seu perfil.",
          );
        }
      } finally {
        if (active) setProfileLoading(false);
      }
    }

    loadProfileSex();
    return () => {
      active = false;
    };
  }, []);

  function toggleValue<T extends string>(current: T[], value: T) {
    return current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
  }

  function toggleExclusive<T extends string>(current: T[], value: T, exclusive: T) {
    if (value === exclusive) return current.includes(value) ? [] : [value];
    const withoutExclusive = current.filter((item) => item !== exclusive);
    return toggleValue(withoutExclusive, value);
  }

  function handlePainAnswer(value: YesNoAnswer) {
    setCurrentPain(value);
    if (value === "no") {
      setPainRegions([]);
      setPainContexts([]);
    }
    clearMessages();
  }

  function handleInjuryAnswer(value: YesNoAnswer) {
    setRelevantInjuryHistory(value);
    if (value === "no") {
      setInjuryRegions([]);
      setRestrictionStatus(null);
    }
    clearMessages();
  }

  function handleExerciseLimit(value: YesNoNotSureAnswer) {
    setExerciseLimit(value);
    if (value === "no") setHasClearGuidance(null);
    clearMessages();
  }

  function clearMessages() {
    setErrorMessage(null);
  }

  async function handleContinue() {
    if (saving) return;

    clearMessages();

    if (!isComplete) {
      setErrorMessage("Complete todas as perguntas obrigatórias antes de continuar.");
      return;
    }

    if (
      currentPain === null ||
      relevantInjuryHistory === null ||
      exerciseLimit === null
    ) {
      setErrorMessage("Complete todas as perguntas obrigatórias antes de continuar.");
      return;
    }

    const { profileUpdate } = buildLimitationsProfileUpdate({
      currentPain,
      painRegions,
      painContexts,
      relevantInjuryHistory,
      injuryRegions,
      restrictionStatus,
      movementRestrictions,
      exerciseWarningSigns,
      exerciseLimit,
      hasClearGuidance,
      pregnancyStatus: showsPregnancyQuestion ? pregnancyStatus : null,
    });

    try {
      setSaving(true);
      await saveLimitations(profileUpdate);
      setSavedSafetyClearanceRequired(
        profileUpdate.safety_clearance_required,
      );
      setSavedSpecialPopulationProgramming(
        profileUpdate.requires_special_population_programming,
      );
      setCompleted(true);
    } catch (error) {
      console.error("[LIMITATIONS] Failed to save health screening", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado ao registrar seus cuidados.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (completed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completedContent}>
          <StatusMessage variant="success" message="Cuidados registrados" />
          <Text style={styles.nextStep}>Próxima etapa: medidas corporais</Text>
          {savedSafetyClearanceRequired ? (
            <StatusMessage
              variant="info"
              message="Antes de aumentar a intensidade dos exercícios, recomendamos conversar com um profissional de saúde para avaliar essas informações."
            />
          ) : null}
          {savedSpecialPopulationProgramming ? (
            <StatusMessage
              variant="info"
              message="Seu programa deverá considerar cuidados específicos para essa fase."
            />
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <OnboardingHeader
          step={7}
          title="Limitações e cuidados"
          description="Antes de montar seu programa, precisamos saber se existe algo que exija adaptações ou mais cuidado."
        />

        <StatusMessage
          variant="info"
          message="Essas respostas não substituem uma avaliação médica. Elas ajudam a tornar seu treino mais seguro e adequado ao seu contexto."
        />

        <Section title="Dor atual">
          <RadioQuestion
            title="Você sente alguma dor ou desconforto atualmente que possa afetar seus treinos?"
            value={currentPain}
            onChange={handlePainAnswer}
          />

          {requiresPainDetails ? (
            <>
              <ChipQuestion title="Em quais regiões?">
                {bodyRegionOptions.map((option) => (
                  <SelectableChip
                    key={option.value}
                    label={option.label}
                    selected={painRegions.includes(option.value)}
                    onPress={() => {
                      setPainRegions((current) => toggleValue(current, option.value));
                      clearMessages();
                    }}
                  />
                ))}
              </ChipQuestion>
              <ChipQuestion title="Como esse desconforto costuma aparecer?">
                {painContextOptions.map((option) => (
                  <SelectableChip
                    key={option.value}
                    label={option.label}
                    selected={painContexts.includes(option.value)}
                    onPress={() => {
                      setPainContexts((current) => toggleValue(current, option.value));
                      clearMessages();
                    }}
                  />
                ))}
              </ChipQuestion>
            </>
          ) : null}
        </Section>

        <Section title="Lesão ou cirurgia">
          <RadioQuestion
            title="Você teve alguma lesão ou cirurgia que ainda influencia seus movimentos ou treinamento?"
            value={relevantInjuryHistory}
            onChange={handleInjuryAnswer}
          />

          {requiresInjuryDetails ? (
            <>
              <ChipQuestion title="Qual região foi afetada?">
                {bodyRegionOptions.map((option) => (
                  <SelectableChip
                    key={option.value}
                    label={option.label}
                    selected={injuryRegions.includes(option.value)}
                    onPress={() => {
                      setInjuryRegions((current) => toggleValue(current, option.value));
                      clearMessages();
                    }}
                  />
                ))}
              </ChipQuestion>
              <CardQuestion title="Essa condição ainda possui alguma restrição recomendada por um profissional de saúde?">
                {yesNoNotSureOptions.map((option) => (
                  <SelectableCard
                    key={option.value}
                    label={option.label}
                    selected={restrictionStatus === option.value}
                    onPress={() => {
                      setRestrictionStatus(option.value);
                      clearMessages();
                    }}
                  />
                ))}
              </CardQuestion>
            </>
          ) : null}
        </Section>

        <Section title="Movimentos que precisam de cuidado" helper="Opcional. Isso representa uma limitação, não apenas uma preferência.">
          <ChipQuestion title="Existe algum movimento que você sabe que precisa evitar ou adaptar?">
            {movementRestrictionOptions.map((option) => (
              <SelectableChip
                key={option.value}
                label={option.label}
                selected={movementRestrictions.includes(option.value)}
                onPress={() => {
                  setMovementRestrictions((current) =>
                    toggleExclusive(current, option.value, "none"),
                  );
                  clearMessages();
                }}
              />
            ))}
          </ChipQuestion>
        </Section>

        <View style={styles.attentionSection}>
          <Text style={styles.sectionTitle}>Antes de aumentar a intensidade</Text>
          <ChipQuestion title="Alguma destas situações acontece com você atualmente ou aconteceu recentemente?">
            {exerciseWarningSignOptions.map((option) => (
              <SelectableChip
                key={option.value}
                label={option.label}
                selected={exerciseWarningSigns.includes(option.value)}
                onPress={() => {
                  setExerciseWarningSigns((current) =>
                    toggleExclusive(current, option.value, "none"),
                  );
                  clearMessages();
                }}
              />
            ))}
          </ChipQuestion>
          {safetyClearanceRequired ? (
            <StatusMessage
              variant="info"
              message="Antes de aumentar a intensidade dos exercícios, recomendamos conversar com um profissional de saúde para avaliar esses sintomas. Você ainda poderá continuar configurando seu perfil."
            />
          ) : null}
        </View>

        <Section title="Orientações profissionais">
          <CardQuestion title="Algum profissional de saúde já orientou você a limitar ou adaptar exercício físico?">
            {yesNoNotSureOptions.map((option) => (
              <SelectableCard
                key={option.value}
                label={option.label}
                selected={exerciseLimit === option.value}
                onPress={() => handleExerciseLimit(option.value)}
              />
            ))}
          </CardQuestion>

          {requiresGuidanceAnswer ? (
            <RadioQuestion
              title="Você possui orientações claras sobre o que pode ou não fazer?"
              value={hasClearGuidance === null ? null : hasClearGuidance ? "yes" : "no"}
              onChange={(value) => {
                setHasClearGuidance(value === "yes");
                clearMessages();
              }}
            />
          ) : null}
        </Section>

        {showsPregnancyQuestion ? (
          <Section title="Gestação e pós-parto">
            <CardQuestion title="Você está grávida ou teve parto recentemente?">
              {pregnancyStatusOptions.map((option) => (
                <SelectableCard
                  key={option.value}
                  label={option.label}
                  selected={pregnancyStatus === option.value}
                  onPress={() => {
                    setPregnancyStatus(option.value);
                    clearMessages();
                  }}
                />
              ))}
            </CardQuestion>
            {requiresSpecialPopulationProgramming ? (
              <StatusMessage
                variant="info"
                message="Seu programa deverá considerar cuidados específicos para essa fase."
              />
            ) : null}
          </Section>
        ) : null}

        {errorMessage ? <StatusMessage message={errorMessage} /> : null}
        {profileErrorMessage ? <StatusMessage message={profileErrorMessage} /> : null}
        <Button
          title="Continuar"
          disabled={!isComplete}
          loading={profileLoading || saving}
          onPress={handleContinue}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  helper,
  children,
}: {
  title: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
      {children}
    </View>
  );
}

function CardQuestion({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.question}>
      <Text style={styles.questionTitle}>{title}</Text>
      <View style={styles.cardList}>{children}</View>
    </View>
  );
}

function ChipQuestion({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.question}>
      <Text style={styles.questionTitle}>{title}</Text>
      <View style={styles.chipList}>{children}</View>
    </View>
  );
}

function RadioQuestion({
  title,
  value,
  onChange,
}: {
  title: string;
  value: YesNoAnswer | null;
  onChange: (value: YesNoAnswer) => void;
}) {
  return (
    <CardQuestion title={title}>
      {yesNoOptions.map((option) => (
        <SelectableCard
          key={option.value}
          label={option.label}
          selected={value === option.value}
          onPress={() => onChange(option.value)}
        />
      ))}
    </CardQuestion>
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
  section: {
    gap: spacing.lg,
    paddingTop: spacing.sm,
  },
  attentionSection: {
    gap: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  question: { gap: spacing.md },
  questionTitle: {
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
  chipList: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  nextStep: {
    color: colors.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    textAlign: "center",
  },
});
