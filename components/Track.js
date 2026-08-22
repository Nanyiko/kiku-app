import { StyleSheet, Text, View } from "react-native";

export default function Track({ song, theme }) {
  const { primary, secondary, tertiary, text } = theme;
  const songName = song?.track?.name;
  const artistNames =
    song?.track?.artists
      ?.map((artist) => artist?.name)
      .filter(Boolean)
      .join(", ") ?? "Unknown artist";
  return (
    <View style={[{ backgroundColor: secondary }, style.cardContainer]}>
      <Text style={[{ color: text }, style.songName]}>{songName}</Text>
      <Text style={[{ color: text }, style.artistNameName]}>{artistNames}</Text>
    </View>
  );
}

const style = StyleSheet.create({
  cardContainer: {
    textAlign: "left",
    padding: 20,
    margin: 20,
  },
  songName: {
    fontSize: 40,
    fontWeight: "bold",
  },
  artistName: {
    fontSize: 20,
    fontWeight: "light",
  },
});
