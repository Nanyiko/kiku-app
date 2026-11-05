import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  FlatList,
  View,
  StyleSheet,
  Text,
  Pressable,
  Image,
  Dimensions,
} from "react-native";
import { getFriends, getAccessToken } from "../../../services/api";
import getSelectedTheme from "../../../../context/theme";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import fetchFriendData from "../../../../context/fetchFriendData";

const defaultTheme = {
  primary: "#C39BD3",
  secondary: "#B892D4",
  tertiary: "#D7A6C7",
  text: "#FFFFFF",
};

export default function Friends() {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [theme, setTheme] = useState(defaultTheme);
  const [loading, setLoading] = useState(true);
  const [tokensLoaded, setTokensLoaded] = useState(false);
  const [friendsList, setFriendsList] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [enrichedFriends, setEnrichedFriends] = useState([]);

  const { primary, secondary, tertiary, text } = theme;
  const { width } = Dimensions.get("screen");

  const loadFriends = async () => {
    try {
      const result = await getFriends();
      setFriendsList(result);
      console.log("Friends API result:", result?.friends);
      setLoading(false);
    } catch (error) {
      console.error("Friends API error:", error.message);
      setLoading(false);
    }
  };
  const loadFriendData = async () => {
    try {
      for (const user of friendsList?.friends) {
        const token = await getAccessToken(user?.id);
        fetchFriendData(
          token.access_token,
          token.refresh_token,
          "https://api.spotify.com/v1/me/player",
          async (data) => {
            if ("error" in data && data.error === 204) {
              fetchFriendData(
                token.access_token,
                token.refresh_token,
                "https://api.spotify.com/v1/me/player/recently-played?limit=1",
                async (data) => {
                  const artistNames =
                    data?.items[0]?.track?.artists
                      ?.map((artist) => artist?.name)
                      .filter(Boolean)
                      .join(", ") ?? "Unknown artist";
                  setEnrichedFriends((prev) => {
                    return [
                      ...prev.filter((friend) => friend.id !== user.id),
                      {
                        ...user,
                        access_token: token.access_token,
                        refresh_token: token.refresh_token,
                        is_playing: false,
                        track: data?.items[0]?.track?.name,
                        artists: artistNames,
                      },
                    ];
                  });
                },
              );
              return;
            } else {
              const artistNames =
                data?.item?.artists
                  ?.map((artist) => artist?.name)
                  .filter(Boolean)
                  .join(", ") ?? "Unknown artist";
              setEnrichedFriends((prev) => {
                return [
                  ...prev.filter((friend) => friend.id !== user.id),
                  {
                    ...user,
                    access_token: token.access_token,
                    refresh_token: token.refresh_token,
                    is_playing: Boolean(data?.is_playing),
                    track: data?.item?.name,
                    artists: artistNames,
                  },
                ];
              });
            }
          },
        );
      }
    } catch (error) {
      console.error("Failed to load access tokens:", error);
    }
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
    if (!tokensLoaded || !token) {
      return;
    }

    loadFriends();
  }, [token, tokensLoaded]);

  useEffect(() => {
    if (!friendsList) return;

    loadFriendData();
  }, [friendsList]);

  const router = useRouter();
  return (
    <LinearGradient
      style={style.container}
      colors={[secondary, primary]}
      start={{ x: 0.5, y: 0.3 }}
      end={{ x: 0, y: 0.5 }}
    >
      <View style={{ flex: 1, top: "5%" }}>
        <View style={style.header}>
          <Text style={[style.headerText, { color: text }]}>Friends</Text>
          <Pressable
            style={[style.addButton, { backgroundColor: primary }]}
            onPress={() => {
              router.navigate("/add-friends");
            }}
          >
            <AntDesign name="usergroup-add" size={24} color={text} />
            <Text style={[style.addButtonText, { color: text }]}>ADD</Text>
          </Pressable>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          {loading ? (
            <Text style={[{ color: text, textAlign: "center" }]}>
              Loading...
            </Text>
          ) : (
            <FlatList
              data={enrichedFriends}
              renderItem={({ item }) => {
                return (
                  <Pressable
                    key={item?.id}
                    style={style.item}
                    onPress={async () => {
                      const token = await getAccessToken(item?.id);
                      console.log(JSON.stringify(token));
                      router.navigate(
                        `/tabs/friend-screens/friend-profile?token=${JSON.stringify(token)}`,
                      );
                    }}
                  >
                    <View
                      style={{
                        borderWidth: item?.is_playing ? 5 : 0,
                        margin: item?.is_playing ? 0 : 5,
                        borderRadius: 50,
                        borderColor: tertiary,
                      }}
                    >
                      {item?.profile_pic != "none" ? (
                        <Image
                          source={{ uri: item.profile_pic }}
                          style={style.image}
                        />
                      ) : (
                        <FontAwesome
                          name="user-circle-o"
                          size={50}
                          color={text}
                        />
                      )}
                    </View>
                    <View>
                      <Text
                        style={[
                          { color: text, fontWeight: "bold", fontSize: 20 },
                        ]}
                      >
                        {item?.display_name}
                      </Text>
                      <Text style={{ color: text, marginRight: 10 }}>
                        <Text style={{ fontWeight: "bold" }}>
                          {item?.track}
                        </Text>{" "}
                        -{" "}
                        <Text style={{ fontWeight: "200" }}>
                          {item?.artists}
                        </Text>
                      </Text>
                    </View>
                  </Pressable>
                );
              }}
              contentContainerStyle={{
                flex: 1,
                width: width,
              }}
              ListEmptyComponent={() => {
                return <Text style={{ color: text }}>You have no friends</Text>;
              }}
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadFriends();
                loadFriendData();
                setRefreshing(false);
              }}
            />
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerText: {
    fontSize: 40,
    fontWeight: "bold",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    width: "90%",
  },
  addButton: {
    margin: 5,
    paddingVertical: 10,
    paddingHorizontal: 25,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 70,
    flexDirection: "row",
    gap: 7.5,
  },
  addButtonText: {
    fontWeight: "semibold",
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});
