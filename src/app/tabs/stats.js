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

  async function getData(timeRange, type) {
    setLoading(true);
    fetchData(
      token,
      refreshToken,
      setToken,
      setRefreshToken,
      `https://api.spotify.com/v1/me/top/${type.toLowerCase()}?time_range=${timeRange}&limit=50`,
      async (data) => {
        console.log("Data fetched");
        setLoading(false);
        try {
          setData(data);
          const jsonValue = JSON.stringify(data);
          await AsyncStorage.setItem(`${timeRange}_${type}`, jsonValue);
        } catch (e) {
          console.error("Error saving data", e);
        }
      },
    );
  }

  useEffect(() => {
    if (tokensLoaded === true) getData(term, type);
  }, [token, tokensLoaded, refreshToken]);

  useEffect(() => {
    setData(async () => {
      const jsonValue = await AsyncStorage.getItem(`${term}_${type}`);
      if (jsonValue === null) getData(term, type);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    });
  }, [type, term]);

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
          <SegmentedControl
            labels={["Artists", "Tracks"]}
            values={["Artists", "Tracks"]}
            theme={theme}
            size="x-large"
            handleClick={(type) => {
              setType(type);
              getData(term, type);
            }}
          />
        </View>
        <SegmentedControl
          labels={["4 weeks", "6 months", "1 year"]}
          values={["short_term", "medium_term", "long_term"]}
          theme={theme}
          size="medium"
          handleClick={(term) => {
            setTerm(term);
            getData(term, type);
          }}
        />
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
    width: "90%",
    borderRadius: 15,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    top: "2%",
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
