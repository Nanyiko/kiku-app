import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
  Dimensions,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getSelectedTheme from "../../../../context/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import fetchFriendData from "../../../../context/fetchFriendData";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Podium from "../../../../components/Podium";
import moment from "moment";

const defaultTheme = {
  primary: "#C39BD3",
  secondary: "#B892D4",
  tertiary: "#D7A6C7",
  text: "#FFFFFF",
  label: "Soft Purple",
};

export default function FriendProfile() {
  const { token } = useLocalSearchParams();
  const { width } = Dimensions.get("screen");

  const [theme, setTheme] = useState(defaultTheme);
  const [userToken, setUserToken] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [topArtists, setTopArtists] = useState(null);
  const [topSongs, setTopSongs] = useState(null);
  const [recents, setRecents] = useState(null);
  const [player, setPlayer] = useState(null);
  const [playerActive, setPlayerActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { primary, secondary, tertiary, text, label } = theme;

  const getProfile = (token) => {
    fetchFriendData(
      token.access_token,
      token.refresh_token,
      "https://api.spotify.com/v1/me",
      async (data) => {
        setUserProfile(data);
      },
    );
  };
  const getRecents = (token) => {
    fetchFriendData(
      token.access_token,
      token.refresh_token,
      "https://api.spotify.com/v1/me/player/recently-played?limit=10",
      async (data) => {
        setRecents(data?.items);
      },
    );
  };

  const getTopArtists = (token) => {
    fetchFriendData(
      token.access_token,
      token.refresh_token,
      "https://api.spotify.com/v1/me/top/artists?limit=5&time_range=short_term",
      async (data) => {
        setTopArtists(data?.items);
      },
    );
  };

  const getTopSongs = (token) => {
    fetchFriendData(
      token.access_token,
      token.refresh_token,
      "https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=short_term",
      async (data) => {
        setTopSongs(data?.items);
      },
    );
  };

  const getPlayer = (token) => {
    fetchFriendData(
      token.access_token,
      token.refresh_token,
      "https://api.spotify.com/v1/me/player",
      async (data) => {
        if ("error" in data && data?.error === 204) {
          setPlayerActive(false);
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
    console.log("Token", token);
  }, []);

  useEffect(() => {
    if (!token) return;
    setUserToken(JSON.parse(token));
  }, []);

  useEffect(() => {
    if (userToken == null) return;

    getProfile(userToken);
    getRecents(userToken);
    getTopArtists(userToken);
    getPlayer(userToken);
    getTopSongs(userToken);
  }, [userToken]);

  return (
    <LinearGradient
      style={styles.container}
      colors={[secondary, primary]}
      start={{ x: 0.5, y: 0.3 }}
      end={{ x: 0, y: 0.5 }}
    >
      {loading ? (
        <View>
          <Text style={[{ color: text, textAlign: "center" }]}>Loading...</Text>
        </View>
      ) : (
        <View style={styles.bodyContainer}>
          <FlatList
            ListHeaderComponent={() => {
              const playerArtistNames =
                player?.item?.artists
                  ?.map((artist) => artist?.name)
                  .filter(Boolean)
                  .join(", ") ?? "Unknown artist";
              return (
                <View>
                  <View style={{ alignItems: "center" }}>
                    {userProfile?.images[0]?.url !== null ? (
                      <Image
                        source={{ uri: userProfile?.images[0]?.url }}
                        style={styles.profilePic}
                      />
                    ) : (
                      <FontAwesome
                        name="user-circle-o"
                        size={300}
                        color="#FFFFFF"
                      />
                    )}
                  </View>
                  <Text style={[styles.displayName, { color: text }]}>
                    {userProfile?.display_name}
                  </Text>
                  <Text style={[styles.username, { color: text }]}>
                    @{userProfile?.id}
                  </Text>
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}
                  >
                    <View
                      style={{
                        width: "80%",
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
                      <FontAwesome6
                        name="record-vinyl"
                        size={24}
                        color="black"
                      />
                      <Text
                        style={{
                          color: text,
                          fontWeight: "bold",
                        }}
                      >
                        {player?.item?.name} -{" "}
                        <Text style={{ fontWeight: "200" }}>
                          {playerArtistNames}
                        </Text>
                      </Text>
                    </View>
                    {playerActive && (
                      <Text style={{ color: text, marginBottom: 10 }}>
                        Now playing on Spotify
                      </Text>
                    )}
                  </View>
                  <Text
                    style={{ marginLeft: 10, color: text, fontWeight: "bold" }}
                  >
                    Recently listened
                  </Text>
                </View>
              );
            }}
            data={recents}
            keyExtractor={(item) => item?.played_at}
            renderItem={({ item }) => {
              const artistNames =
                item?.track?.artists
                  ?.map((artist) => artist?.name)
                  .filter(Boolean)
                  .join(", ") ?? "Unknown artist";
              return (
                <View
                  style={{
                    margin: 10,
                    marginLeft: 0,
                    marginTop: 0,
                    padding: 20,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 15,
                    width: "100%",
                  }}
                  key={item?.played_at}
                >
                  <Image
                    source={{ uri: item?.track?.album?.images[0]?.url }}
                    style={{ width: 70, height: 70, borderRadius: 35 }}
                  />
                  <View style={{ gap: 5 }}>
                    <Text
                      style={{ color: text, fontSize: 18, fontWeight: "bold" }}
                    >
                      {item?.track?.name}
                    </Text>
                    <Text style={{ color: text, fontWeight: "300" }}>
                      {artistNames}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: secondary,
                      paddingHorizontal: 15,
                      paddingVertical: 10,
                      borderRadius: 40,
                    }}
                  >
                    <Text style={{ color: text, fontWeight: "bold" }}>
                      {moment(item?.played_at).fromNow()}
                    </Text>
                  </View>
                </View>
              );
            }}
            ListFooterComponent={() => {
              return (
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginVertical: 10,
                  }}
                >
                  <Text style={{ color: text, fontSize: 20 }}>Top Artists</Text>
                  <Podium data={topArtists} theme={theme} type={"artist"} />
                  <Text style={{ color: text, fontSize: 20 }}>On Repeat</Text>
                  <Podium data={topSongs} theme={theme} type={"track"} />
                </View>
              );
            }}
            ListEmptyComponent={() => {
              return (
                <View>
                  <Text style={{ color: text }}>
                    This user does not listen to music
                  </Text>
                </View>
              );
            }}
            contentContainerStyle={{
              width: width,
            }}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              getProfile(userToken);
              getRecents(userToken);
              getTopArtists(userToken);
              getTopSongs(userToken);
              getPlayer(userToken);
              setRefreshing(false);
            }}
          />
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: "10%",
    alignItems: "center",
  },
  profilePic: {
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  bodyContainer: {},
  displayName: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
  },
  username: {
    fontWeight: "200",
    textAlign: "center",
  },
});
