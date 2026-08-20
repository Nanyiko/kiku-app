import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import getSelectedTheme from "../../../context/theme";

const defaultTheme = {
  primary: "#C39BD3",
  secondary: "#B892D4",
  tertiary: "#D7A6C7",
  text: "#FFFFFF",
};

export default function Recents() {
  const [theme, setTheme] = useState(defaultTheme);
  const [username, setUsername] = useState("");
  const [profilePicUri, setProfilePicUri] = useState("");
  const [storedTheme, setStoredTheme] = useState("default");
  const [loading, setLoading] = useState(true);

  const { primary, secondary, tertiary, text } = theme;

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
        setLoading(false);
      } catch (error) {
        console.warn("Failed to load recents data:", error);
      }
    };

    loadData();
  }, []);

  return loading ? (
    <View>
      <Text>Loading...</Text>
    </View>
  ) : (
    <View style={[style.container, { backgroundColor: primary }]}>
      <Text>Username: {username || "No username saved"}</Text>
      <Text>Profile URI: {profilePicUri || "No profile image saved"}</Text>
      <Text>Theme: {storedTheme}</Text>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
