import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const CLIENT_ID = "6c623457efa94755aae18971b7ee0afb";

export default function Onboarding() {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState(username);

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
          await AsyncStorage.setItem("username", username);
          await AsyncStorage.setItem(
            "profile_pic_uri",
            retryData?.images[0]?.url,
          );
          return;
        }

        setProfile(data);
        setUsername(data?.display_name ?? "");
        await AsyncStorage.setItem("username", username);
        await AsyncStorage.setItem("profile_pic_uri", data?.images[0]?.url);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile(token);
  }, [token, refreshToken]);

  const profileImage = profile?.images?.[0]?.url;
  useEffect(() => {
    setDisplayName(() => {
      return username || profile?.display_name || "KiKU User";
    });
  }, [username]);

  return (
    <View style={style.container}>
      {profile === null && username !== "" ? (
        <Text>Loading...</Text>
      ) : (
        <>
          <View style={style.headerContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={style.profilePic} />
            ) : (
              <FontAwesome name="user-circle-o" size={300} color="#FFFFFF" />
            )}
            <Text style={style.headerText}>Welcome to KiKU</Text>
          </View>

          <View style={style.inputContainer}>
            <Text style={style.displayName}>{displayName}</Text>
          </View>

          <Pressable
            style={style.button}
            onPress={() => {
              router.replace("/theme-select");
              AsyncStorage.setItem("username", username);
              AsyncStorage.setItem("profile_pic_uri", profileImage);
            }}
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
    backgroundColor: "#121212",
  },
  headerContainer: {
    display: "flex",
    justifyContent: "center",
    alignContent: "flex-end",
  },
  headerText: {
    fontSize: 40,
    color: "#FFFFFF",
  },
  inputContainer: {
    width: "70%",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 15,
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
    borderRadius: 20,
    backgroundColor: "#1ED760",
    width: 100,
    justifyContent: "Center",
    alignItems: "center",
  },
  buttonText: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    color: "#121212",
    fontWeight: "bold",
  },
  displayName: {
    color: "#FFFFFF",
  },
});
