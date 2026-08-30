import moment from "moment";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import ListenOnSpotify from "./ListenOnSpotify";

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
  const link = song?.track?.external_urls?.spotify;
  const time = song?.played_at;
  const relativeTime = moment(time).fromNow();
  return (
    <View style={style.container}>
      <View style={[style.card]}>
        <Image
          source={{
            uri: imageURI,
          }}
          style={style.image}
        />
        <Text style={[{ color: text }, style.songName]}>{songName}</Text>
        <Text style={[{ color: text }, style.artistName]}>{artistNames}</Text>
        <Text style={[{ color: text }, style.time]}>{relativeTime}</Text>
        <ListenOnSpotify theme={theme} link={link} />
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    height: height,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
  },
  card: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  songName: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
  },
  artistName: {
    fontSize: 15,
    fontWeight: "200",
    textAlign: "center",
  },
  image: {
    width: 300,
    height: 300,
  },
  time: {
    marginTop: 5,
  },
});
