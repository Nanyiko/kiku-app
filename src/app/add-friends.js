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
import { useState, useEffect, useMemo } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  getUsers,
  getFriends,
  getMe,
  sendFriendRequest,
  getSentFriendRequests,
  getIncomingFriendRequests,
  respondToFriendRequest,
} from "../services/api";
import SegmentedControl from "../../components/SegmentedControl";

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
  const [friendsList, setFriendsList] = useState(null);
  const [incomingFriendRequests, setIncomingFriendRequests] = useState(null);
  const [sentFriendsRequests, setSentFriendRequests] = useState(null);
  const [me, setMe] = useState(null);
  const [relationshipsLoaded, setRelationshipsLoaded] = useState(false);
  const [screen, setScreen] = useState("search");

  const { primary, secondary, tertiary, text } = theme;

  const usersWithFriendshipStatus = useMemo(() => {
    if (
      !Array.isArray(users) ||
      !Array.isArray(friendsList) ||
      !Array.isArray(sentFriendsRequests) ||
      !Array.isArray(incomingFriendRequests) ||
      !me
    ) {
      return [];
    }

    return users.map((user) => {
      const isFriend = friendsList.some(
        (friend) => String(friend.id) === String(user.id),
      );

      if (isFriend) {
        console.log("Is friend");
        return { ...user, friend_status: "friend" };
      }

      const isRequestSent = sentFriendsRequests.some(
        (request) =>
          String(request.sender_id) === String(me.id) &&
          String(request.receiver_id) === String(user.id),
      );

      if (isRequestSent) {
        console.log("Request sent");
        return { ...user, friend_status: "request_sent" };
      }

      const isRequestReceived = incomingFriendRequests.some(
        (request) =>
          String(request.sender_id) === String(user.id) &&
          String(request.receiver_id) === String(me.id),
      );

      if (isRequestReceived) {
        console.log("Request sent");
        return { ...user, friend_status: "request_received" };
      }

      console.log("none");
      return { ...user, friend_status: "none" };
    });
  }, [users, friendsList, sentFriendsRequests, incomingFriendRequests, me]);

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
        setUsers(result?.users ?? []);
        console.log("Users API result:", result?.users);
        setLoading(false);
      } catch (error) {
        console.error("Users API error:", error.message);
        setLoading(false);
      }
    };

    const loadMe = async () => {
      try {
        const result = await getMe();
        setMe(result?.me[0]);
        console.log("Current user:", result?.me[0]);
        setLoading(false);
      } catch (error) {
        console.error("Users API error:", error.message);
        setLoading(false);
      }
    };

    const loadFriends = async () => {
      try {
        const result = await getFriends();
        setFriendsList(result?.friends ?? []);
        console.log("Friends list:", result?.friends);
        setLoading(false);
      } catch (error) {
        console.error("Friends API error:", error.message);
        setLoading(false);
      }
    };

    const loadIncomingFriendRequests = async () => {
      try {
        const result = await getIncomingFriendRequests();
        setIncomingFriendRequests(result?.requests ?? []);
        console.log("Incoming friend requests:", result?.requests);
        setLoading(false);
      } catch (error) {
        console.error("Friends API error:", error.message);
        setLoading(false);
      }
    };

    const loadSentFriendRequests = async () => {
      try {
        const result = await getSentFriendRequests();
        setSentFriendRequests(result?.requests ?? []);
        console.log("Sent friend requests:", result?.requests);
        setLoading(false);
      } catch (error) {
        console.error("Friends API error:", error.message);
        setLoading(false);
      }
    };

    loadUsers();
    loadMe();
    loadFriends();
    loadSentFriendRequests();
    loadIncomingFriendRequests();
  }, [token, tokensLoaded]);

  const AddButton = ({ friend_status, id }) => {
    if (friend_status == "none" || !friend_status) {
      return (
        <Pressable
          style={[
            style.addButton,
            style.button,
            { backgroundColor: primary, borderColor: secondary },
          ]}
          onPress={() => {
            sendFriendRequest(id);
          }}
        >
          <MaterialIcons name="person-add-alt-1" size={24} color={text} />
          <Text style={[style.buttonText, { color: text }]}>ADD</Text>
        </Pressable>
      );
    } else if (friend_status == "request_sent") {
      return (
        <Pressable
          style={[
            style.requestButton,
            style.button,
            { backgroundColor: primary, borderColor: secondary },
          ]}
          onPress={() => {
            console.log("Cancel");
          }}
        >
          <MaterialCommunityIcons name="cancel" size={24} color={text} />
          <Text style={[style.buttonText, { color: text }]}>Cancel</Text>
        </Pressable>
      );
    } else if (friend_status == "request_received") {
      return (
        <View style={{ flexDirection: "row", gap: 5 }}>
          <Pressable
            style={[
              style.respondButton,
              style.button,
              { backgroundColor: "#EAFFE6", borderColor: "#21CC00" },
            ]}
            onPress={() => {
              respondToFriendRequest(id, "accepted");
            }}
          >
            <FontAwesome name="check" size={24} color="#21CC00" />
            <Text style={[style.buttonText, { color: "#21CC00" }]}>Accept</Text>
          </Pressable>
          {/* <Pressable
            style={[
              style.respondButton,
              style.button,
              { backgroundColor: "#FFE6E6", borderColor: "#D10007" },
            ]}
            onPress={() => {
              console.log("Reject");
            }}
          >
            <AntDesign name="close" size={24} color="#D10007" />
          </Pressable> */}
        </View>
      );
    } else if (friend_status == "friend") {
      return (
        <Pressable
          style={[
            style.disabledButton,
            style.button,
            { backgroundColor: primary, borderColor: secondary },
          ]}
          onPress={() => {
            console.log("Already friends");
          }}
        >
          <Text style={[style.buttonText, { color: text }]}>
            Already friends
          </Text>
        </Pressable>
      );
    }
  };

  return (
    <View style={[style.container, { backgroundColor: secondary }]}>
      <View style={style.header}>
        <Text style={[style.headerText, { color: text }]}>Add Friends</Text>
      </View>
      <View style={style.bodyContainer}>
        <View style={style.contentContainer}>
          <View>
            <SegmentedControl
              items={[
                { label: "Search", value: "search" },
                { label: "Friends Requests", value: "requests" },
              ]}
              size={"small"}
              theme={theme}
              handleClick={(screen) => {
                setScreen(screen);
              }}
            />
          </View>
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
            {loading && relationshipsLoaded ? (
              <Text style={[{ color: text, textAlign: "center" }]}>
                Loading...
              </Text>
            ) : (
              <FlatList
                key={screen}
                data={
                  screen === "search"
                    ? usersWithFriendshipStatus.filter((user) => {
                        const query = searchInput.trim().toLowerCase();

                        return (
                          user.display_name?.toLowerCase().includes(query) ||
                          user.username?.toLowerCase().includes(query)
                        );
                      })
                    : incomingFriendRequests
                }
                keyExtractor={(item) => String(item.id)}
                style={style.list}
                contentContainerStyle={style.userList}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const isRequestScreen = screen === "requests";

                  return (
                    <View
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
                          flex: 1,
                        }}
                      >
                        <Image
                          source={{ uri: item.profile_pic }}
                          style={style.image}
                        />

                        <View style={{ flex: 1 }}>
                          <Text
                            style={[{ color: text }, style.displayName]}
                            numberOfLines={1}
                          >
                            {item.display_name || item.username}
                          </Text>

                          <Text style={{ color: text }} numberOfLines={1}>
                            {isRequestScreen
                              ? `@${item.username}`
                              : `@${item.username}`}
                          </Text>
                        </View>
                      </View>

                      {/* Action button */}
                      {isRequestScreen ? (
                        <AddButton
                          friend_status="request_received"
                          id={item.id}
                        />
                      ) : (
                        <AddButton
                          friend_status={item.friend_status}
                          id={item.id}
                        />
                      )}
                    </View>
                  );
                }}
                ListEmptyComponent={
                  <Text
                    style={{
                      color: text,
                      textAlign: "center",
                      marginTop: 30,
                    }}
                  >
                    {loading
                      ? "Loading..."
                      : screen === "search"
                        ? "No users found."
                        : "No incoming friend requests."}
                  </Text>
                }
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
  button: {
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    gap: 5,
  },
  addButton: {
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderTopWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  requestButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  disabledButton: {
    borderWidth: 2,
    padding: 10,
  },
  buttonText: {
    fontWeight: "bold",
  },
  respondButton: {
    borderWidth: 3,
    padding: 7.5,
  },
});
