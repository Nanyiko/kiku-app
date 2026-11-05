import { View, Text, StyleSheet, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getSelectedTheme from "../../../../context/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";

const defaultTheme = {
  primary: "#C39BD3",
  secondary: "#B892D4",
  tertiary: "#D7A6C7",
  text: "#FFFFFF",
  label: "Soft Purple",
};

export default function FriendProfile() {
  const { token } = useLocalSearchParams();

  const [theme, setTheme] = useState(defaultTheme);
  const [userToken, setUserToken] = useState(null);

  const { primary, secondary, tertiary, text, label } = theme;
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const selectedTheme = await getSelectedTheme();
        setTheme(selectedTheme);
      } catch (error) {
        console.warn("Failed to load recents data:", error);
      }
    };

    loadTheme();
    console.log("Token", token);
  }, []);

  useEffect(() => {
    if (!token) return;
    setUserToken(JSON.parse(token));
  }, []);

  return (
    <LinearGradient
      style={styles.container}
      colors={[secondary, primary]}
      start={{ x: 0.5, y: 0.3 }}
      end={{ x: 0, y: 0.5 }}
    >
      <Pressable
        style={{ padding: 20, backgroundColor: secondary }}
        onPress={() => {
          console.log(userToken);
        }}
      >
        <Text style={{ color: text }}>Press me</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
