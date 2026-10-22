import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  FlatList,
} from "react-native";
import getSelectedTheme from "../../context/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  getUsers,
  sendFriendRequest,
  getSentFriendRequests,
  getIncomingFriendRequests,
} from "../services/api";

const defaultTheme = {
  primary: "#C39BD3",
  secondary: "#B892D4",
  tertiary: "#D7A6C7",
  text: "#FFFFFF",
};

export default function AddFriends() {
  const [theme, setTheme] = useState(defaultTheme);
  const [storedTheme, setStoredTheme] = useState("default");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [tokensLoaded, setTokensLoaded] = useState(false);
  const [users, setUsers] = useState(null);

  const { primary, secondary, tertiary, text } = theme;

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

    const loadUsers = async () => {
      try {
        const result = await getUsers();
        setUsers(result?.users);
        console.log("Users API result:", result?.users);
        setLoading(false);
      } catch (error) {
        console.error("Users API error:", error.message);
        setLoading(false);
      }
    };

    loadUsers();
  }, [token, tokensLoaded]);

  function addUser(receiverId) {}

  return (
    <View style={[style.container, { backgroundColor: secondary }]}>
      <View style={style.header}>
        <Text style={style.headerText}>Add Friends</Text>
      </View>
      <View style={style.bodyContainer}>
        <View style={style.contentContainer}>
          <View style={style.searchBarContainer}>
            <TextInput
              placeholder="Search..."
              placeholderTextColor={text}
              value={searchInput}
              onChangeText={setSearchInput}
              style={[
                style.searchBar,
                {
                  color: text,
                  backgroundColor: primary,
                },
              ]}
            />
            <Pressable
              onPress={() => {
                setSearchInput("");
              }}
            >
              <MaterialIcons name="cancel" size={30} color={text} />
            </Pressable>
          </View>
          <View style={style.listContainer}>
            {loading ? (
              <Text style={[{ color: text, textAlign: "center" }]}>
                Loading...
              </Text>
            ) : (
              <FlatList
                data={users}
                style={style.list}
                renderItem={({ item }) => {
                  return (
                    <Pressable
                      key={item?.id}
                      style={[
                        {
                          backgroundColor: primary,
                          borderColor: secondary,
                          width: "95%",
                        },
                        style.card,
                      ]}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 10,
                          alignItems: "center",
                        }}
                      >
                        <Image
                          source={{ uri: item?.profile_pic }}
                          style={style.image}
                        />
                        <View>
                          <Text style={[{ color: text }, style.displayName]}>
                            {item?.display_name}
                          </Text>
                          <Text style={[{ color: text }]}>
                            item?.created_at
                          </Text>
                        </View>
                      </View>
                      <Pressable
                        style={[
                          style.addButton,
                          { backgroundColor: primary, borderColor: secondary },
                        ]}
                        onPress={() => {
                          addUser(item?.id);
                        }}
                      >
                        <MaterialIcons
                          name="person-add-alt-1"
                          size={24}
                          color={text}
                        />
                        <Text style={[style.addButtonText, { color: text }]}>
                          ADD
                        </Text>
                      </Pressable>
                    </Pressable>
                  );
                }}
                contentContainerStyle={style.userList}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: "100%",
  },
  headerText: {
    textAlign: "left",
    fontSize: 35,
    fontWeight: "bold",
  },
  bodyContainer: {
    width: "100%",
    flex: 1,
    alignItems: "center",
  },
  contentContainer: {
    width: "100%",
    flex: 1,
    alignItems: "center",
  },
  listContainer: {
    width: "100%",
    flex: 1,
  },
  list: {
    flex: 1,
  },
  searchBarContainer: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 16,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    gap: 8,
  },
  searchBar: {
    padding: 10,
    borderRadius: 15,
    flex: 1,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  card: {
    padding: 20,
    margin: 10,
    marginHorizontal: 0,
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  displayName: {
    fontSize: 20,
    fontWeight: "600",
  },
  userList: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 16,
  },
  addButton: {
    borderRadius: 15,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderTopWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    gap: 5,
  },
  addButtonText: {
    fontWeight: "bold",
  },
});
