import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const CLIENT_ID = "6c623457efa94755aae18971b7ee0afb";

export default function Onboarding() {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState("");

  const router = useRouter();

  useEffect(() => {
    const getTokens = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("access_token");
        const refreshTokenValue = await AsyncStorage.getItem("refresh_token");

        setToken(accessToken);
        setRefreshToken(refreshTokenValue);
      } catch (error) {
        console.error("Failed to load tokens:", error);
      }
    };

    getTokens();
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchProfile = async (currentToken) => {
      try {
        const response = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        });

        const data = await response.json();

        if (!data || typeof data !== "object") {
          setProfile(null);
          return;
        }

        if ("error" in data && data.error?.status === 401) {
          if (!refreshToken) {
            console.warn("No refresh token available");
            return;
          }

          console.log("Fetching new token");

          const refreshResponse = await fetch(
            "https://accounts.spotify.com/api/token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                client_id: CLIENT_ID,
                grant_type: "refresh_token",
                refresh_token: refreshToken,
              }).toString(),
            },
          );

          const refreshData = await refreshResponse.json();
          const newAccessToken = refreshData?.access_token;
          const newRefreshToken = refreshData?.refresh_token ?? refreshToken;

          if (!newAccessToken) {
            console.error("Refresh token request failed:", refreshData);
            return;
          }

          await AsyncStorage.setItem("access_token", newAccessToken);
          await AsyncStorage.setItem("refresh_token", newRefreshToken);

          setToken(newAccessToken);
          setRefreshToken(newRefreshToken);

          const retryResponse = await fetch("https://api.spotify.com/v1/me", {
            headers: {
              Authorization: `Bearer ${newAccessToken}`,
            },
          });

          const retryData = await retryResponse.json();

          setProfile(retryData ?? null);
          setUsername(retryData?.display_name ?? "");
          return;
        }

        setProfile(data);
        setUsername(data.display_name ?? "");
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile(token);
  }, [token, refreshToken]);

  const profileImage = profile?.images?.[0]?.url;
  const displayName = username || profile?.display_name || "KikU User";

  return (
    <View style={style.container}>
      {profile == null ? (
        <Text>Loading...</Text>
      ) : (
        <>
          <View style={style.headerContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={style.profilePic} />
            ) : (
              <View style={[style.profilePic, style.placeholderAvatar]} />
            )}
            <Text style={style.headerText}>Welcome to KikU</Text>
          </View>

          <View style={style.inputContainer}>
            <TextInput
              style={style.input}
              value={displayName}
              onChangeText={setUsername}
              numberOfLines={1}
              cursorColor={"#277DF5"}
              textAlign="center"
              editable={false}
            />
          </View>

          <Pressable
            style={style.button}
            onPress={() => router.navigate("/theme-select")}
          >
            <Text style={style.buttonText}>Next</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    display: "flex",
    justifyContent: "center",
    alignContent: "flex-end",
  },
  headerText: {
    fontSize: 40,
  },
  inputContainer: {
    width: "100%",
    height: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 15,
    borderColor: "#333333",
    width: "90%",
    padding: 20,
  },
  profilePic: {
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  placeholderAvatar: {
    backgroundColor: "#d9d9d9",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    margin: 30,
    borderWidth: 0.3,
    borderRadius: 10,
  },
  buttonText: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
