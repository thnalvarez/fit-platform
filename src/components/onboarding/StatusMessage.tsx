import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "../../theme";

type StatusMessageProps = {
  message: string;
  variant?: "error" | "success" | "info";
};

export function StatusMessage({
  message,
  variant = "error",
}: StatusMessageProps) {
  const color =
    variant === "success"
      ? colors.success
      : variant === "info"
        ? colors.accent
        : colors.danger;

  return (
    <View style={[styles.container, { borderColor: color }]}>
      <Text accessibilityLiveRegion="polite" style={[styles.text, { color }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  text: {
    fontSize: typography.fontSize.md,
    lineHeight: 22,
  },
});
