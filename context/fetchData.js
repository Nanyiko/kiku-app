import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerSpotifyTokens } from "../src/services/api";

const CLIENT_ID = "6c623457efa94755aae18971b7ee0afb";

const fetchData = async (
  currentToken,
  refreshToken,
  setToken,
  setRefreshToken,
  endpoint,
  afterFetch,
) => {
  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    });

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

      await AsyncStorage.setItem("access_token", newAccessToken);
      await AsyncStorage.setItem("refresh_token", newRefreshToken);

      setToken(newAccessToken);
      setRefreshToken(newRefreshToken);

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

      const retryData = await retryResponse.json();
      afterFetch(retryData);
      return;
    }

    console.warn("Fetching data");
    afterFetch(data);
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }
};

export default fetchData;
