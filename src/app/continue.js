import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Image, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";

export default function Continue() {
  const [displayName, setDisplayName] = useState("");
  const [profilePicUri, setProfilePicUri] = useState("");

  const router = useRouter();

  useEffect(() => {
    async function fetchDisplayName() {
      const username = await AsyncStorage.getItem("username");
      const profile_pic_uri = await AsyncStorage.getItem("profile_pic_uri");

      setDisplayName(username);
      setProfilePicUri(profile_pic_uri);
    }
    fetchDisplayName();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.promptText}>Continue as:</Text>
      <Text style={styles.displayName}>{displayName || "Loading..."}</Text>
      <Image source={{ uri: profilePicUri }} style={styles.profilePic} />
      <Pressable
        style={styles.button}
        onPress={() => {
          router.replace("/tabs");
        }}
      >
        <Text style={{ color: "#121212" }}>Continue</Text>
      </Pressable>
      <Pressable>
        <Text>Not me...</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  promptText: {
    color: "#FFFFFF",
  },
  profilePic: {
    width: 300,
    height: 300,
  },
  button: {
    margin: 20,
    width: 300,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1ED760",
    borderRadius: 20,
  },
});
