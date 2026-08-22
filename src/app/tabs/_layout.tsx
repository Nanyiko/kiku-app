import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import getSelectedTheme from "../../../context/theme";

const defaultTheme = {
  primary: "#C39BD3",
  secondary: "#B892D4",
  tertiary: "#D7A6C7",
  text: "#FFFFFF",
};

export default function TabsLayout() {
  const [theme, setTheme] = useState(defaultTheme);
  const [storedTheme, setStoredTheme] = useState("default");
  const [loading, setLoading] = useState(true);

  const { primary, secondary, tertiary, text } = theme;

  useEffect(() => {
    const loadData = async () => {
      try {
        const selectedTheme = await getSelectedTheme();
        setTheme(selectedTheme);
        const savedTheme = await AsyncStorage.getItem("theme");
        setStoredTheme(savedTheme ?? "default");
        setLoading(false);
      } catch (error) {
        console.warn("Failed to load recents data:", error);
        setLoading(false);
      }
    };

    loadData();
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
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveBackgroundColor: secondary,
            tabBarActiveTintColor: text,
            tabBarStyle: {
              backgroundColor: secondary,
            },
          }}
        >
          <Tabs.Screen name="recents" options={{ title: "Recents" }} />
        </Tabs>
      )}
    </SafeAreaView>
  );
}
