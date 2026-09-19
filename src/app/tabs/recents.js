import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import Track from "../../../components/Track";
import fetchData from "../../../context/fetchData";
import getSelectedTheme from "../../../context/theme";

const defaultTheme = {
  primary: "#C39BD3",
  secondary: "#B892D4",
  tertiary: "#D7A6C7",
  text: "#FFFFFF",
};

const { height } = Dimensions.get("window");

export default function Recents() {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [theme, setTheme] = useState(defaultTheme);
  const [loading, setLoading] = useState(true);
  const [recents, setRecents] = useState([]);
  const [tokensLoaded, setTokensLoaded] = useState(false);
  const [storedTheme, setStoredTheme] = useState("default");

  const listRef = useRef(null);

  const { primary, secondary, tertiary, text } = theme;

  useEffect(() => {
    const loadData = async () => {
      try {
        const selectedTheme = await getSelectedTheme();
        setTheme(selectedTheme);
        const savedTheme = await AsyncStorage.getItem("theme");
        setStoredTheme(savedTheme ?? "default");
        setLoading(false);
      } catch (error) {
        console.warn("Failed to load recents data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  async function getData() {
    setLoading(true);
    fetchData(
      token,
      refreshToken,
      setToken,
      setRefreshToken,
      "https://api.spotify.com/v1/me/player/recently-played?limit=50",
      async (data) => {
        setRecents((prev) => {
          const recentItems = data?.items ?? [];
          return [...prev, ...recentItems];
        });
        console.log("Recent data fetched");
        setLoading(false);
        try {
          const jsonValue = JSON.stringify(data);
          await AsyncStorage.setItem("recents", jsonValue);
        } catch (e) {
          console.error("Error saving recent data", e);
        }
      },
    );
  }

  useEffect(() => {
    getData();
  }, [token, tokensLoaded, refreshToken]);

  return (
    <LinearGradient
      style={style.container}
      colors={[secondary, primary]}
      start={{ x: 0.5, y: 0.3 }}
      end={{ x: 0, y: 0.5 }}
    >
      {loading ? (
        <Text style={[{ color: text }]}>Loading...</Text>
      ) : (
        <View style={{ alignItems: "center" }}>
          <FlatList
            data={recents ?? []}
            renderItem={({ item }) => <Track song={item} theme={theme} />}
            keyExtractor={(item) => item?.played_at}
            horizontal={false}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToInterval={height}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum
            ref={listRef}
          />
        </View>
      )}
    </LinearGradient>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
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
  refreshButton: {
    position: "absolute",
    paddingVertical: 5,
    paddingHorizontal: 15,
    top: "10%",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    flexDirection: "row",
    gap: 5,
  },
});
