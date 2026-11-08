import { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  View,
  Image,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
} from "react-native";
import getSelectedTheme from "../../../context/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import fetchData from "../../../context/fetchData";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const defaultTheme = {
  primary: "#C39BD3",
  secondary: "#B892D4",
  tertiary: "#D7A6C7",
  text: "#FFFFFF",
  label: "Soft Purple",
};

export default function Profile() {
  const [theme, setTheme] = useState(defaultTheme);
  const [profilePicUri, setProfilePicUri] = useState(null);
  const [username, setUsername] = useState(null);
  const [player, setPlayer] = useState(null);
  const [playerActive, setPlayerActive] = useState(false);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [tokensLoaded, setTokensLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  const { primary, secondary, tertiary, text, label } = theme;

  const getPlayer = () => {
    fetchData(
      token,
      refreshToken,
      setToken,
      setRefreshToken,
      "https://api.spotify.com/v1/me/player",
      async (data) => {
        if ("error" in data && data?.error === 204) {
          setPlayerActive(false);
          setPlayer({ error: 204 });
        } else {
          setPlayer(data);
          setPlayerActive(data?.is_playing);
        }
        setLoading(false);
      },
    );
  };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const selectedTheme = await getSelectedTheme();
        setTheme(selectedTheme);
      } catch (error) {
        console.warn("Failed to load recents data:", error);
      }
    };

    loadTheme();
  }, []);
  useEffect(() => {
    const loadData = async () => {
      const profilePic = await AsyncStorage.getItem("profile_pic_uri");
      const displayName = await AsyncStorage.getItem("username");

      setProfilePicUri(profilePic);
      setUsername(displayName);
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

  useEffect(() => {
    if (!tokensLoaded) return;

    getPlayer();
  }, [token, tokensLoaded]);
  const playerArtistNames =
    player?.item?.artists
      ?.map((artist) => artist?.name)
      .filter(Boolean)
      .join(", ") ?? "Unknown artist";
  return (
    <LinearGradient
      style={styles.container}
      colors={[secondary, primary]}
      start={{ x: 0.5, y: 0.3 }}
      end={{ x: 0, y: 0.5 }}
    >
      {loading ? (
        <Text style={{ color: text }}>Loading...</Text>
      ) : (
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                setLoading(true);
                getPlayer();
                setRefreshing(false);
              }}
            />
          }
        >
          {profilePicUri !== "none" ? (
            <Image source={{ uri: profilePicUri }} style={styles.profilePic} />
          ) : (
            <FontAwesome name="user-circle-o" size={300} color="#FFFFFF" />
          )}
          <Text style={[styles.displayName, { color: text }]}>{username}</Text>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            {!("error" in player) && player?.error !== 204 && (
              <View
                style={{
                  width: "80%",
                  alignSelf: "center",
                  justifyContent: "center",
                  borderWidth: playerActive && 5,
                  margin: playerActive ? 10 : 15,
                  borderRadius: 15,
                  borderColor: tertiary,
                  backgroundColor: secondary,
                  padding: 20,
                  alignItems: "center",
                  flexDirection: "row",
                  gap: 10,
                }}
              >
                <FontAwesome6 name="record-vinyl" size={24} color="black" />
                <Text
                  style={{
                    color: text,
                    fontWeight: "bold",
                  }}
                >
                  {player?.item?.name} -{" "}
                  <Text style={{ fontWeight: "200" }}>{playerArtistNames}</Text>
                </Text>
              </View>
            )}
            {playerActive && (
              <Text style={{ color: text, marginBottom: 10 }}>
                Now playing on Spotify
              </Text>
            )}
          </View>
          <View
            style={[styles.separator, { backgroundColor: secondary }]}
          ></View>
          <View style={styles.tab}>
            <View
              style={{ flexDirection: "row", gap: 20, alignItems: "center" }}
            >
              <Text style={{ color: text }}>Theme</Text>
              <Text style={{ color: text, fontWeight: "bold", fontSize: 20 }}>
                {label}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                router.replace("theme-select?context=change");
              }}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 15,
              }}
            >
              <Text style={{ color: text, textDecorationLine: "underline" }}>
                Change
              </Text>
            </Pressable>
          </View>
          <Pressable
            style={{ margin: 10, padding: 10 }}
            onPress={() => {
              router.replace("/continue");
            }}
          >
            <Text style={{ textDecorationLine: "underline", color: text }}>
              Log out
            </Text>
          </Pressable>
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  profilePic: {
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  displayName: {
    fontSize: 40,
    fontWeight: "bold",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    justifyContent: "space-between",
  },
  separator: {
    borderWidth: 0.5,
    width: "80%",
  },
});
