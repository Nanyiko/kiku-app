import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import getSelectedTheme from "../../../context/theme";

const defaultTheme = {
  primary: "#C39BD3",
  secondary: "#B892D4",
  tertiary: "#D7A6C7",
  text: "#FFFFFF",
};

export default function Friends() {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [theme, setTheme] = useState(defaultTheme);
  const [loading, setLoading] = useState(true);
  const [tokensLoaded, setTokensLoaded] = useState(false);
  const [storedTheme, setStoredTheme] = useState("default");

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

  useEffect(() => {
    const getTokens = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("access_token");
        const refreshTokenValue = await AsyncStorage.getItem("refresh_token");

        setToken(accessToken);
        setRefreshToken(refreshTokenValue);
      } catch (error) {
        console.error("Failed to load tokens:", error);
      } finally {
        setTokensLoaded(true);
      }
    };

    getTokens();
  }, []);
  return (
    <LinearGradient
      style={style.container}
      colors={[secondary, primary]}
      start={{ x: 0.5, y: 0.3 }}
      end={{ x: 0, y: 0.5 }}
    >
      <Text style={style.leText}>Friends twin</Text>
    </LinearGradient>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  leText: {},
});
