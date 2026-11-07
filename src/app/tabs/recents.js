import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Track from "../../../components/Track";
import fetchData from "../../../context/fetchData";
import fetchFriendData from "../../../context/fetchFriendData";
import getSelectedTheme from "../../../context/theme";
import Octicons from "@expo/vector-icons/Octicons";
import { getFriends, getMe, getAccessToken } from "../../services/api";
import SegmentedControl from "../../../components/SegmentedControl";

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
  const [refreshing, setRefreshing] = useState(false);
  const [me, setMe] = useState(null);
  const [friendsList, setFriendsList] = useState(null);
  const [screen, setScreen] = useState("personal");
  const [sharedFeed, setSharedFeed] = useState([]);

  const listRef = useRef(null);

  const { primary, secondary, tertiary, text } = theme;

  const loadFriends = async () => {
    try {
      const result = await getFriends();
      setFriendsList(result);
      console.log("Friends API result:", result?.friends);
    } catch (error) {
      console.error("Friends API error:", error.message);
    }
  };

  const loadMe = async () => {
    try {
      const result = await getMe();
      setMe(result?.me[0]);
      console.log("Current user:", result?.me[0]);
    } catch (error) {
      console.error("Users API error:", error.message);
    }
  };

  const loadSharedFeed = async () => {
    setSharedFeed([]);
    fetchData(
      token,
      refreshToken,
      setToken,
      setRefreshToken,
      "https://api.spotify.com/v1/me/player/recently-played?limit=50",
      async (data) => {
        setSharedFeed((prev) => {
          const recentItems = data?.items ?? [];
          const username = me?.display_name;
          const profilePic = me?.profile_pic;

          const enrichedItems = recentItems.map((item) => ({
            ...item,
            username,
            profile_pic: profilePic,
          }));

          return [...prev, ...enrichedItems];
        });
        console.log("Shared feed fetched");
        setLoading(false);
      },
    );
    for (let user of friendsList?.friends) {
      const token = await getAccessToken(user?.id);

      fetchFriendData(
        token?.access_token,
        token?.refresh_token,
        "https://api.spotify.com/v1/me/player/recently-played?limit=50",
        async (data) => {
          setSharedFeed((prev) => {
            const recentItems = data?.items ?? [];
            const username = user?.display_name;
            const profilePic = user?.profile_pic;

            const enrichedItems = recentItems.map((item) => ({
              ...item,
              username,
              profile_pic: profilePic,
            }));

            return [...prev, ...enrichedItems];
          });
        },
      );
    }

    setSharedFeed((prev) => {
      return prev.sort((a, b) => {
        const timestampA = new Date(a?.played_at).getTime();
        const timestampB = new Date(b?.played_at).getTime();

        return timestampB - timestampA;
      });
    });
  };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const selectedTheme = await getSelectedTheme();
        setTheme(selectedTheme);
        setLoading(false);
      } catch (error) {
        console.warn("Failed to load recents data:", error);
        setLoading(false);
      }
    };

    loadTheme();
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
    fetchData(
      token,
      refreshToken,
      setToken,
      setRefreshToken,
      "https://api.spotify.com/v1/me/player/recently-played?limit=50",
      async (data) => {
        setRecents(() => {
          const recentItems = data?.items ?? [];
          return [...recentItems];
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

  async function refreshData() {
    fetchData(
      token,
      refreshToken,
      setToken,
      setRefreshToken,
      "https://api.spotify.com/v1/me/player/recently-played?limit=50",
      async (data) => {
        setRecents(() => {
          const recentItems = data?.items ?? [];
          return [...recentItems];
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
    if (!tokensLoaded) return;
    setLoading(true);
    getData();
    loadFriends();
    loadMe();
  }, [token, tokensLoaded]);

  useEffect(() => {
    if (!friendsList) return;
    loadSharedFeed();
  }, [token, tokensLoaded, friendsList]);

  return (
    <LinearGradient
      style={style.container}
      colors={[secondary, primary]}
      start={{ x: 0.5, y: 0.3 }}
      end={{ x: 0, y: 0.5 }}
    >
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={[{ color: text }]}>Loading...</Text>
        </View>
      ) : (
        <View style={{ alignItems: "center" }}>
          <View
            style={{
              position: "absolute",
              top: "5%",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 3000,
            }}
          >
            <SegmentedControl
              items={[
                { label: "Personal", value: "personal" },
                { label: "Shared Feed", value: "shared" },
              ]}
              size={"medium"}
              theme={theme}
              handleClick={(screen) => {
                setScreen(screen);
              }}
            />
          </View>
          <FlatList
            data={screen === "personal" ? recents : sharedFeed}
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
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              refreshData();
              setRefreshing(false);
            }}
            ListEmptyComponent={() => {
              return (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text>No recent activity</Text>
                </View>
              );
            }}
          />
          <Pressable
            style={[style.scrollToTopButton, { backgroundColor: secondary }]}
            onPress={() => {
              listRef?.current?.scrollToIndex({
                index: 0,
                animated: true,
              });
            }}
          >
            <Text style={[style.scrollToTopButtonText, { color: text }]}>
              Scroll to top
            </Text>
            <Octicons name="move-to-top" size={24} color={text} />
          </Pressable>
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
  scrollToTopButton: {
    position: "absolute",
    bottom: "1%",
    padding: 7.5,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    borderRadius: 30,
  },
  scrollToTopButtonText: {
    fontWeight: "bold",
  },
});
