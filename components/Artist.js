import { Dimensions, Image, StyleSheet, Text, View } from "react-native";

export default function Artist({ item, theme, ranking, type }) {
  const { width } = Dimensions.get("screen");
  const { primary, secondary, tertiary, text } = theme;
  const artistNames =
    type == "Tracks"
      ? (item?.artists
          ?.map((artist) => artist?.name)
          .filter(Boolean)
          .join(", ") ?? "Unknown artist")
      : null;
  const imageUrl =
    type == "Tracks" ? item?.album?.images[0]?.url : item?.images[0]?.url;
  return (
    <View
      key={item?.id}
      style={[
        { backgroundColor: primary, borderColor: secondary, width: width - 20 },
        styles.container,
      ]}
    >
      <Text style={[{ color: text }, styles.ranking]}>#{ranking}</Text>
      <View style={[styles.separator, { borderColor: text }]}></View>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View>
        <Text style={[{ color: text }, styles.artist]}>{item?.name}</Text>
        {type === "Tracks" && (
          <Text style={[{ color: text }]}>{artistNames}</Text>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
    margin: 10,
    marginHorizontal: 0,
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  artist: {
    fontSize: 20,
    fontWeight: "semibold",
    width: "100%",
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
  separator: { borderWidth: 0.5, height: "100%" },
});
