import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "../../theme";

type OnboardingHeaderProps = {
  step: number;
  title: string;
  description?: string;
};

export function OnboardingHeader({
  step,
  title,
  description,
}: OnboardingHeaderProps) {
  return (
    <View>
      <Text style={styles.step}>ETAPA {step} DE 12</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
