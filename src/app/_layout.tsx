import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Welcome" }} />
        <Stack.Screen
          name="onboarding"
          options={{ title: "Onboarding", headerShown: false }}
        />
        <Stack.Screen
          name="theme-select"
          options={{ title: "Theme Select", headerShown: false }}
        />
        <Stack.Screen
          name="home"
          options={{ title: "Home", headerShown: false }}
        />
      </Stack>
    </>
  );
}
