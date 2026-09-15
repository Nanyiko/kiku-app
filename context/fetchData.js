import AsyncStorage from "@react-native-async-storage/async-storage";

const fetchData = async (
  currentToken,
  type,
  time_range,
  refreshToken,
  setToken,
  setRefreshToken,
  setLoading,
  setData,
) => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/me/top/${type}?time_range=${time_range}&limit=50`,
      {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      },
    );

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
      const retryResponse = await fetch(
        `https://api.spotify.com/v1/me/top/${type}?time_range=${time_range}&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${newAccessToken}`,
          },
        },
      );

      const retryData = await retryResponse.json();
      console.log("Data fetched");
      setLoading(false);
      try {
        setData(retryData);
        const jsonValue = JSON.stringify(retryData);
        await AsyncStorage.setItem(`${time_range}_${type}`, jsonValue);
      } catch (e) {
        console.error("Error saving data", e);
      }
      return;
    }

    console.warn("Fetching data");
    console.log("Data fetched");
    setLoading(false);
    try {
      setData(data);
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(`${time_range}_${type}`, jsonValue);
    } catch (e) {
      console.error("Error saving data", e);
    }
  } catch (error) {
    console.error("Failed to fetch profile:", error);
  }
};

export default fetchData;
