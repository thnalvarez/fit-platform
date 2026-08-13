import { Stack } from "expo-router";

import { colors } from "../theme";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/register" options={{ title: "Criar conta" }} />
      <Stack.Screen name="(auth)/login" options={{ title: "Entrar" }} />
      <Stack.Screen name="(onboarding)/profile" options={{ title: "Sobre você" }} />
      <Stack.Screen name="(onboarding)/goal" options={{ title: "Seu objetivo" }} />
      <Stack.Screen name="(onboarding)/routine" options={{ title: "Rotina" }} />
      <Stack.Screen name="(onboarding)/experience" options={{ title: "Experiência" }} />
      <Stack.Screen
        name="(onboarding)/training-location"
        options={{ title: "Local e equipamentos" }}
      />
      <Stack.Screen
        name="(onboarding)/preferences"
        options={{ title: "Preferências" }}
      />
      <Stack.Screen
        name="(onboarding)/limitations"
        options={{ title: "Limitações e cuidados" }}
      />
      <Stack.Screen
        name="(onboarding)/measurements"
        options={{ title: "Medidas corporais" }}
      />
      <Stack.Screen
        name="(onboarding)/recovery"
        options={{ title: "Hábitos e recuperação" }}
      />
    </Stack>
  );
}
