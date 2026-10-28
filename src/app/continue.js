import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerSpotifyTokens } from "../services/api";
import * as AuthSession from "expo-auth-session";
import { View, Image, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";

const CLIENT_ID = "6c623457efa94755aae18971b7ee0afb";

const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

export default function Continue() {
  const [displayName, setDisplayName] = useState("");
  const [profilePicUri, setProfilePicUri] = useState("");

  const router = useRouter();

  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true,
    scheme: "kikuapp",
    path: "callback",
  });
  console.log("redirectUri:", redirectUri);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: [
        "user-read-email",
        "user-read-private",
        "user-read-recently-played",
        "user-top-read",
      ],
      usePKCE: true,
      redirectUri,
    },
    discovery,
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      exchangeCode(code, request.codeVerifier);
    }
  }, [response]);

  const exchangeCode = async (code, codeVerifier) => {
    try {
      const body = new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }).toString();

      const tokenResponse = await fetch(
        "https://accounts.spotify.com/api/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        },
      );

      const data = await tokenResponse.json();

      if (!tokenResponse.ok || !data.access_token) {
        console.error(
          "Spotify token exchange failed:",
          data.error || data.error_description || tokenResponse.status,
        );
        return;
      }

      // Store the tokens locally, as your existing login flow does.
      await AsyncStorage.setItem("access_token", data.access_token);

      if (data.refresh_token) {
        await AsyncStorage.setItem("refresh_token", data.refresh_token);
      }

      // Register the verified Spotify user and persist encrypted tokens in Kiku's database.
      try {
        const kikuUser = await registerSpotifyTokens({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in,
          scope: data.scope || "",
        });

        console.log("Kiku account registered:", kikuUser.id);
      } catch (error) {
        // Keep your existing login flow working if backend persistence fails.
        console.error("Token persistence failed:", error.message);
      }

      router.replace("/onboarding");
    } catch (error) {
      console.error("Login failed:", error.message);
    }
  };

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
      <Text style={styles.displayName}>{displayName}</Text>
      {profilePicUri !== "" && (
        <Image source={{ uri: profilePicUri }} style={styles.profilePic} />
      )}
      <Pressable
        style={[styles.button, { backgroundColor: "#1ED760" }]}
        onPress={() => {
          router.replace("/tabs");
        }}
      >
        <Text style={{ color: "#121212" }}>Continue</Text>
      </Pressable>
      <Pressable
        style={[styles.button, { backgroundColor: "#333333" }]}
        onPress={async () => {
          await AsyncStorage.setItem("authenticated", "false");
          promptAsync();
        }}
      >
        <Text style={{ color: "#FFFFFF" }}>Not me...</Text>
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
    borderRadius: 150,
  },
  button: {
    marginHorizontal: 20,
    marginVertical: 10,
    width: 300,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  displayName: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 10,
  },
});
