import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import Track from "../../../components/Track";
import getSelectedTheme from "../../../context/theme";

const defaultTheme = {
  primary: "#C39BD3",
  secondary: "#B892D4",
  tertiary: "#D7A6C7",
  text: "#FFFFFF",
};

export default function Recents() {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [theme, setTheme] = useState(defaultTheme);
  const [username, setUsername] = useState("");
  const [profilePicUri, setProfilePicUri] = useState("");
  const [storedTheme, setStoredTheme] = useState("default");
  const [loading, setLoading] = useState(true);
  const [recents, setRecents] = useState(null);
  const [renderStart, setRenderStart] = useState(0);
  const [renderLimit, setRenderLimit] = useState(9);
  const [tokensLoaded, setTokensLoaded] = useState(false);

  const listRef = useRef(null);

  const { primary, secondary, tertiary, text } = theme;

  useEffect(() => {
    const getTokens = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("access_token");
        const refreshTokenValue = await AsyncStorage.getItem("refresh_token");

        setToken(accessToken);
        setRefreshToken(refreshTokenValue);
      } catch (error) {
        console.error("Failed to load tokens:", error);
      } finally {
        setTokensLoaded(true);
      }
    };

    getTokens();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const selectedTheme = await getSelectedTheme();
        setTheme(selectedTheme);

        const savedUsername = await AsyncStorage.getItem("username");
        const savedProfilePicUri =
          await AsyncStorage.getItem("profile_pic_uri");
        const savedTheme = await AsyncStorage.getItem("theme");

        setUsername(savedUsername ?? "");
        setProfilePicUri(savedProfilePicUri ?? "");
        setStoredTheme(savedTheme ?? "default");
      } catch (error) {
        console.warn("Failed to load recents data:", error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!tokensLoaded || !token) return;
    if (recents !== null) {
      console.warn("Fetching recent data from AsyncStorage");
      async function getSavedRecents() {
        try {
          const jsonValue = await AsyncStorage.getItem("recents");
          setRecents(jsonValue != null ? JSON.parse(jsonValue) : null);
        } catch (e) {
          console.error("Error getting saved recent activity", e);
        }
      }
      console.log("Recent data fetched");
      return;
    }

    const fetchRecents = async (currentToken) => {
      try {
        const response = await fetch(
          "https://api.spotify.com/v1/me/player/recently-played?limit=50",
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          },
        );

        const data = await response.json();

        if (!data || typeof data !== "object") {
          setRecents(null);
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

          console.warn("Fetching recent data");
          const retryResponse = await fetch(
            "https://api.spotify.com/v1/me/player/recently-played?limit=50",
            {
              headers: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            },
          );

          const retryData = await retryResponse.json();

          setRecents(retryData ?? null);
          console.log("Recent data fetch");
          setLoading(false);
          try {
            const jsonValue = JSON.stringify(retryData);
            await AsyncStorage.setItem("recents", jsonValue);
          } catch (e) {
            console.error("Error saving recent data", e);
          }
          return;
        }

        console.warn("Fetching recent data");
        setRecents(data);
        console.log("Recent data fetched");
        setLoading(false);
        try {
          const jsonValue = JSON.stringify(data);
          await AsyncStorage.setItem("recents", jsonValue);
        } catch (e) {
          console.error("Error saving recent data", e);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchRecents(token);
  }, [tokensLoaded, token, refreshToken]);

  return loading ? (
    <View style={[style.container, { backgroundColor: primary }]}>
      <Text style={[{ color: text }]}>Loading...</Text>
    </View>
  ) : (
    <View style={[style.container, { backgroundColor: primary }]}>
      <FlatList
        data={recents?.items.slice(renderStart, renderLimit) ?? []}
        renderItem={({ item }) => <Track song={item} theme={theme} />}
        keyExtractor={(item) => item?.played_at}
        horizontal={false}
        ref={listRef}
        style={style.listContainer}
      />
      <View style={style.buttonContainer}>
        <Pressable
          style={[
            { backgroundColor: secondary, borderColor: tertiary },
            style.button,
          ]}
          onPress={() => {
            if (renderStart > 0) {
              setRenderStart(renderStart - 10);
              setRenderLimit(renderLimit - 10);
              listRef.current.scrollToOffset({
                offset: renderStart,
                animated: true,
              });
            }
          }}
          disabled={renderStart <= 0}
        >
          <Text style={[{ color: text }, style.buttonText]}>Previous</Text>
        </Pressable>
        <Pressable
          style={[
            { backgroundColor: secondary, borderColor: tertiary },
            style.button,
          ]}
          onPress={() => {
            if (renderLimit < 49) {
              setRenderStart(renderStart + 10);
              setRenderLimit(renderLimit + 10);
              listRef.current.scrollToOffset({
                offset: renderStart,
                animated: true,
              });
            }
          }}
          disabled={renderLimit >= 50}
        >
          <Text style={[{ color: text }, style.buttonText]}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    marginTop: 50,
  },
  button: {
    margin: 30,
    borderWidth: 2,
    borderRadius: 10,
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
  },
  buttonText: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
