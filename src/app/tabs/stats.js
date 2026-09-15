import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Artist from "../../../components/Artist";
import SegmentedControl from "../../../components/SegmentedControl";
import fetchData from "../../../context/fetchData";
import getSelectedTheme from "../../../context/theme";

const defaultTheme = {
  primary: "#C39BD3",
  secondary: "#B892D4",
  tertiary: "#D7A6C7",
  text: "#FFFFFF",
  label: "Soft Purple",
};

export default function Stats() {
  const [theme, setTheme] = useState(defaultTheme);
  const [storedTheme, setStoredTheme] = useState("default");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [tokensLoaded, setTokensLoaded] = useState(false);
  const [data, setData] = useState(null);
  const [type, setType] = useState("Artists");
  const [term, setTerm] = useState("short_term");
  const [searchInput, setSearchInput] = useState("");

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
        console.warn("Failed to load data:", error);
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

  useEffect(() => {
    if (searchInput !== "") {
      console.log("Hi");
    }
  }, [searchInput]);

  async function getData(timeRange) {
    setLoading(true);
    fetchData(
      token,
      type.toLowerCase(),
      timeRange,
      refreshToken,
      setToken,
      setRefreshToken,
      setLoading,
      setData,
    );
  }

  useEffect(() => {
    setData(async () => {
      const jsonValue = await AsyncStorage.getItem(`${term}_${type}`);
      if (jsonValue === null) getData(term);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    });
  }, [type]);

  return (
    <LinearGradient
      style={style.container}
      colors={[secondary, primary]}
      start={{ x: 0.5, y: 0.3 }}
      end={{ x: 0, y: 0.5 }}
    >
      <>
        <View
          style={[
            { backgroundColor: primary, borderColor: secondary },
            style.header,
          ]}
        >
          <View style={[style.headerText]}>
            <Text style={[{ color: text }, style.label]}>{type}</Text>
            <Pressable
              onPress={() => {
                if (type === "Tracks") setType("Artists");
                if (type === "Artists") setType("Tracks");
              }}
            >
              <FontAwesome name="exchange" size={30} color={text} />
            </Pressable>
          </View>
        </View>
        <View
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
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
        </View>
        <SegmentedControl
          values={["4 weeks", "6 months", "1 year"]}
          terms={["short_term", "medium_term", "long_term"]}
          theme={theme}
          handleClick={(term) => {
            getData(term);
            setTerm(term);
          }}
        />
        {loading ? (
          <Text style={{ color: text }}>Loading...</Text>
        ) : (
          <FlatList
            data={
              searchInput === ""
                ? (data?.items ?? [])
                : (data?.items).filter((item) => {
                    return item?.name
                      ?.toLowerCase()
                      .includes(searchInput.toLowerCase());
                  })
            }
            renderItem={({ item }) => (
              <Artist
                theme={theme}
                item={item}
                key={item?.id}
                ranking={data?.items.indexOf(item) + 1}
                type={type}
              />
            )}
            keyExtractor={(item) => item?.id}
            showsVerticalScrollIndicator={false}
            horizontal={false}
            ListEmptyComponent={() => {
              return (
                <View>
                  {searchInput === "" ? (
                    <Text style={[{ color: text }]}>
                      There is{" "}
                      <Text style={{ fontWeight: "bold" }}>somehow</Text>{" "}
                      nothing to show
                    </Text>
                  ) : (
                    <Text style={{ color: text, textAlign: "center" }}>
                      {searchInput} is not part of you top 50{" "}
                      {type.toLowerCase()}
                    </Text>
                  )}
                </View>
              );
            }}
          />
        )}
      </>
    </LinearGradient>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  header: {
    margin: 20,
    minWidth: "90%",
    borderRadius: 15,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderWidth: 3,
  },
  headerText: {
    padding: 5,
    margin: 15,
    flexDirection: "row",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 40,
    fontWeight: "bold",
  },
  searchBarContainer: {
    flexDirection: "row",
    width: "90%",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    gap: 5,
  },
  searchBar: {
    padding: 10,
    borderRadius: 15,
    width: "100%",
  },
});
