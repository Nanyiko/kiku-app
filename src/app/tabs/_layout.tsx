import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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
            tabBarActiveBackgroundColor: primary,
            tabBarActiveTintColor: text,
            tabBarStyle: {
              backgroundColor: primary,
            },
            tabBarInactiveBackgroundColor: primary,
            tabBarPosition: "bottom",
          }}
          screenListeners={{
            tabPress: (e) => {
              console.log(e);
            },
          }}
        >
          <Tabs.Screen
            name="recents"
            options={{
              title: "Recents",
              tabBarIcon: ({ color }) => (
                <MaterialIcons size={24} name="queue-music" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="stats"
            options={{
              title: "Stats",
              tabBarIcon: ({ color }) => (
                <Ionicons name="podium" size={24} color={color} />
              ),
            }}
          />
        </Tabs>
      )}
    </SafeAreaView>
  );
}
