import { router } from "expo-router";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

import { Button } from "../components/ui/Button";
import { colors, spacing, typography } from "../theme";

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View>
          <Text style={styles.eyebrow}>FIT PLATFORM</Text>

          <Text style={styles.title}>
            Seu treino.{"\n"}
            Sua alimentação.{"\n"}
            Sua evolução.
          </Text>

          <Text style={styles.description}>
            Um acompanhamento personalizado construído para seus objetivos,
            rotina e progresso.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button title="Começar" onPress={() => router.push("/register")} />

          <Button
            title="Já tenho uma conta"
            variant="secondary"
            onPress={() => router.push("/login")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },

  eyebrow: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 2,
    marginBottom: spacing.lg,
  },

  title: {
    color: colors.primary,
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 48,
  },

  description: {
    color: colors.secondary,
    fontSize: typography.fontSize.md,
    lineHeight: 24,
    marginTop: spacing.lg,
    maxWidth: 420,
  },

  actions: {
    gap: spacing.md,
  },
});
