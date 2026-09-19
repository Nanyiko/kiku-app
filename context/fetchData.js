import AsyncStorage from "@react-native-async-storage/async-storage";

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
    console.error("Failed to fetch profile:", error);
  }
};

export default fetchData;
