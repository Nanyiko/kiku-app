import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerSpotifyTokens } from "../src/services/api";
import { Alert } from "react-native";

const CLIENT_ID = "6c623457efa94755aae18971b7ee0afb";

const fetchFriendData = async (
  currentToken,
  refreshToken,
  endpoint,
  afterFetch,
) => {
  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    });

    if (response.status === 204) {
      afterFetch({ error: 204 });
      return;
    }
    const data = await response.json();

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

      try {
        const kikuUser = await registerSpotifyTokens({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: refreshData.expires_in,
          scope: refreshData.scope || "",
        });

        console.log("Kiku account registered:", kikuUser.id);
      } catch (error) {
        console.error("Token persistence failed:", error.message);
      }

      console.warn("Fetching data");
      const retryResponse = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${newAccessToken}`,
        },
      });

      console.log("Response status:", retryResponse.status);
      if (retryResponse.status === 204) {
        afterFetch({ error: 204 });
        return;
      } else if ("error" in data && data.error?.status === 429) {
        Alert.alert("Error", data?.error?.message);
        afterFetch({ error: 429 });
        return;
      }
      const retryData = await retryResponse.json();
      if ("error" in retryData && retryData.error?.status === 429) {
        const retryAfter = retryResponse.headers.get("Retry-After");
        Alert.alert(
          "Error",
          `${retryData?.error?.message}\nRetry after ${retryAfter} seconds`,
        );
        return;
      }
      afterFetch(retryData);
      return;
    } else if ("error" in data && data.error?.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      Alert.alert(
        "Error",
        `${data?.error?.message}\nRetry after ${retryAfter} seconds`,
      );
      return;
    }

    console.warn("Fetching data");
    afterFetch(data);
    return;
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }
};

export default fetchFriendData;
