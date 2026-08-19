import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

const CLIENT_ID = "6c623457efa94755aae18971b7ee0afb";

const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

export default function Index() {
  const router = useRouter();

  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true,
  });
  console.log(redirectUri);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: [
        "user-read-email",
        "user-read-private",
        "user-read-recently-played",
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
    console.log("TOKEN RESPONSE:", data);

    if (data.access_token) {
      await AsyncStorage.setItem("access_token", data.access_token);
      await AsyncStorage.setItem("refresh_token", data.refresh_token);
      router.replace("/onboarding");
    } else {
      console.log("Token failed:", data);
    }
  };

  return (
    <View style={style.container}>
      <Text>Spotify Login</Text>
      <Button
        title="Login with Spotify"
        disabled={!request}
        onPress={() => promptAsync()}
      />
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
