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
import { getFriends } from "../../services/api";
import getSelectedTheme from "../../../context/theme";
import AntDesign from "@expo/vector-icons/AntDesign";

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
  const [storedTheme, setStoredTheme] = useState("default");
  const [friendsList, setFriendsList] = useState(null);

  const { primary, secondary, tertiary, text } = theme;
  const { width } = Dimensions.get("screen");

  useEffect(() => {
    const loadData = async () => {
      try {
        const selectedTheme = await getSelectedTheme();
        setTheme(selectedTheme);
        const savedTheme = await AsyncStorage.getItem("theme");
        setStoredTheme(savedTheme ?? "default");
      } catch (error) {
        console.warn("Failed to load recents data:", error);
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

  useEffect(() => {
    if (!tokensLoaded || !token) {
      return;
    }

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

    loadFriends();
  }, [token, tokensLoaded]);
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
          <Pressable style={[style.addButton, { backgroundColor: primary }]}>
            <AntDesign name="usergroup-add" size={24} color={text} />
            <Text style={[style.addButtonText, { color: text }]}>ADD</Text>
          </Pressable>
        </View>
        <View>
          {loading ? (
            <Text style={[{ color: text }]}>Loading...</Text>
          ) : (
            <FlatList
              data={friendsList?.friends || []}
              renderItem={({ item }) => {
                return (
                  <Pressable key={item?.id} style={style.item}>
                    <Image
                      source={{ uri: item?.profile_pic }}
                      style={style.profilePic}
                    />
                    <View>
                      <Text
                        style={[
                          { color: text, fontWeight: "bold", fontSize: 20 },
                        ]}
                      >
                        {item?.display_name}
                      </Text>
                      <Text style={{ color: text, fontWeight: "light" }}>
                        Random song - Random Artist
                      </Text>
                    </View>
                  </Pressable>
                );
              }}
              contentContainerStyle={{
                flex: 1,
                width: width,
                justifyContent: "center",
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
    gap: 20,
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
});
