import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const CLIENT_ID = "6c623457efa94755aae18971b7ee0afb";

export default function Onboarding() {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const getTokens = async () => {
      try {
        const access_token = await AsyncStorage.getItem("access_token");
        console.log("Access Token:", access_token);
        setToken(access_token);

        const refresh_token = await AsyncStorage.getItem("refresh_token");
        console.log("Refresh Token:", refresh_token);
        setRefreshToken(refresh_token);
      } catch (e) {
        console.error(e);
      }
    };

    getTokens();
  }, []);

  useEffect(() => {
    async function getProfile(token) {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await response.json();
      console.log("Profile:", data);
      setProfile(data);
    }

    getProfile(token);
  }, []);

  useEffect(() => {
    if (profile != null) {
      if (profile["error"]) {
        async function newToken() {
          const response = await fetch(
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
          const data = await response.json();
          console.log("Refresh token:", data);
          setToken(data["access_token"]);
        }

        async function getProfile(token) {
          const response = await fetch("https://api.spotify.com/v1/me", {
            headers: {
              Authorization: "Bearer " + token,
            },
          });

          const data = await response.json();
          console.log("Profile:", data);
          setProfile(data);
        }

        newToken();
        getProfile(token);
      }
    }
  }, [profile]);

  return (
    <View style={style.container}>
      <Text>
        Welcome {profile["display_name"] ? profile["display_name"] : "Uhhh..."}
      </Text>
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
