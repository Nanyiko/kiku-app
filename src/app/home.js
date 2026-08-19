import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import getSelectedTheme from "../../context/theme";

const defaultTheme = {
  primary: "#C39BD3",
  secondary: "#B892D4",
  tertiary: "#D7A6C7",
};

export default function Home() {
  const [theme, setTheme] = useState(defaultTheme);
  const [username, setUsername] = useState("");
  const [profilePicUri, setProfilePicUri] = useState("");
  const [storedTheme, setStoredTheme] = useState("default");

  const { primary, secondary, tertiary } = theme;

  useEffect(() => {
    const loadData = async () => {
      try {
        const selectedTheme = await getSelectedTheme();
        setTheme(selectedTheme);

        const savedUsername = await AsyncStorage.getItem("username");
        const savedProfilePicUri =
          await AsyncStorage.getItem("profile_pic_uri");
        const savedTheme = await AsyncStorage.getItem("theme");

        setUsername(savedUsername ?? "");
        setProfilePicUri(savedProfilePicUri ?? "");
        setStoredTheme(savedTheme ?? "default");
      } catch (error) {
        console.warn("Failed to load recents data:", error);
      }
    };

    loadData();
  }, []);

  return (
    <NativeTabs
      screenListeners={{
        tabPress: (e) => {
          console.log("Any tab pressed");
        },
      }}
    >
      <NativeTabs.Trigger name="recents" />
    </NativeTabs>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
