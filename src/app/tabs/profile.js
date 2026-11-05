import { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { View, Image, Text, StyleSheet, Pressable } from "react-native";
import getSelectedTheme from "../../../context/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const defaultTheme = {
  primary: "#C39BD3",
  secondary: "#B892D4",
  tertiary: "#D7A6C7",
  text: "#FFFFFF",
  label: "Soft Purple",
};

export default function Profile() {
  const [theme, setTheme] = useState(defaultTheme);
  const [profilePicUri, setProfilePicUri] = useState(null);
  const [username, setUsername] = useState(null);

  const router = useRouter();

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
  }, []);
  useEffect(() => {
    const loadData = async () => {
      const profilePic = await AsyncStorage.getItem("profile_pic_uri");
      const displayName = await AsyncStorage.getItem("username");

      setProfilePicUri(profilePic);
      setUsername(displayName);
    };
    loadData();
  }, []);
  return (
    <LinearGradient
      style={styles.container}
      colors={[secondary, primary]}
      start={{ x: 0.5, y: 0.3 }}
      end={{ x: 0, y: 0.5 }}
    >
      {profilePicUri !== "none" ? (
        <Image source={{ uri: profilePicUri }} style={styles.profilePic} />
      ) : (
        <FontAwesome name="user-circle-o" size={300} color="#FFFFFF" />
      )}
      <Text style={[styles.displayName, { color: text }]}>{username}</Text>
      <View style={[styles.separator, { backgroundColor: secondary }]}></View>
      <View style={styles.tab}>
        <View style={{ flexDirection: "row", gap: 20 }}>
          <Text style={{ color: text }}>Theme</Text>
          <Text style={{ color: text }}>{label}</Text>
        </View>
        <Pressable
          onPress={() => {
            router.replace("theme-select?context=change");
          }}
          style={{
            backgroundColor: text,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 15,
          }}
        >
          <Text style={{ color: primary }}>Change</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  profilePic: {
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  displayName: {
    fontSize: 40,
    fontWeight: "bold",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    justifyContent: "space-between",
  },
  separator: {
    borderWidth: 0.5,
    width: "80%",
  },
});
