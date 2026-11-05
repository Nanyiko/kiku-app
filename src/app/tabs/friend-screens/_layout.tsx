import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import getSelectedTheme from "../../../../context/theme";

const defaultTheme = {
  primary: "#C39BD3",
  secondary: "#B892D4",
  tertiary: "#D7A6C7",
  text: "#FFFFFF",
};

export default function TabsLayout() {
  const [theme, setTheme] = useState(defaultTheme);
  const [loading, setLoading] = useState(true);

  const { primary, secondary, tertiary, text } = theme;

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const selectedTheme = await getSelectedTheme();
        setTheme(selectedTheme);
        setLoading(false);
      } catch (error) {
        console.warn("Failed to load recents data:", error);
        setLoading(false);
      }
    };

    loadTheme();
  }, []);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: secondary }}
      edges={["left", "right"]}
    >
      {loading ? (
        <View>
          <Text>Loading...</Text>
        </View>
      ) : (
        <Stack>
          <Stack.Screen
            name="friends"
            options={{ title: "Friends", headerShown: false }}
          />
          <Stack.Screen
            name="friend-profile"
            options={{ title: "Friends Profile", headerShown: false }}
          />
        </Stack>
      )}
    </SafeAreaView>
  );
}
