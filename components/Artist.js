import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  Linking,
} from "react-native";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";

export default function Artist({ item, theme, ranking, type }) {
  const { primary, secondary, text } = theme;
  const artistNames =
    type == "Tracks"
      ? (item?.artists
          ?.map((artist) => artist?.name)
          .filter(Boolean)
          .join(", ") ?? "Unknown artist")
      : null;
  const imageUrl =
    type == "Tracks" ? item?.album?.images[0]?.url : item?.images[0]?.url;
  const link = item?.external_urls?.spotify;
  console.log(link);
  return (
    <View
      key={item?.id}
      style={[
        { backgroundColor: primary, borderColor: secondary },
        styles.container,
      ]}
    >
      <Text style={[{ color: text }, styles.ranking]}>#{ranking}</Text>
      <View style={[styles.separator, { borderColor: text }]} />
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.details}>
        <Text style={[{ color: text }, styles.artist]}>{item?.name}</Text>
        {type === "Tracks" && (
          <Text style={{ color: text, fontWeight: "200" }}>{artistNames}</Text>
        )}
      </View>
      <Pressable
        style={{ padding: 10 }}
        onPress={async () => {
          await Linking.openURL(link);
        }}
      >
        <SimpleLineIcons name="arrow-right" size={24} color={text} />
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: "100%",
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  details: {
    flex: 1,
    minWidth: 0,
  },
  artist: {
    fontSize: 20,
    fontWeight: "semibold",
    flexShrink: 1,
    fontWeight: "bold",
  },
  ranking: {
    fontSize: 26,
    fontWeight: "bold",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  separator: { borderWidth: 0.5, alignSelf: "stretch" },
});
