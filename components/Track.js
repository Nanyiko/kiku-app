import { Dimensions, Image, StyleSheet, Text, View } from "react-native";

const { height } = Dimensions.get("window");

export default function Track({ song, theme }) {
  const { primary, secondary, tertiary, text } = theme;
  const songName = song?.track?.name;
  const artistNames =
    song?.track?.artists
      ?.map((artist) => artist?.name)
      .filter(Boolean)
      .join(", ") ?? "Unknown artist";
  const imageURI = song?.track?.album?.images[0]?.url;
  return (
    <View style={style.cardContainer}>
      <View
        style={{
          backgroundColor: secondary,
          padding: 20,
          marginHorizontal: 20,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={{
            uri: imageURI,
          }}
          style={style.image}
        />
        <Text style={[{ color: text }, style.songName]}>{songName}</Text>
        <Text style={[{ color: text }, style.artistName]}>{artistNames}</Text>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  cardContainer: {
    height: height,
    textAlign: "left",
    justifyContent: "center",
    alignItems: "center",
  },
  songName: {
    fontSize: 40,
    fontWeight: "bold",
  },
  artistName: {
    fontSize: 15,
    fontWeight: "200",
  },
  image: {
    width: 300,
    height: 300,
  },
});
