import moment from "moment";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import ListenOnSpotify from "./ListenOnSpotify";

const { height } = Dimensions.get("window");

export default function Track({ song, theme, screen }) {
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
  const explicit = song?.track?.explicit;
  const username = screen === "shared" ? song?.username : null;
  const profilePic = screen === "shared" ? song.profile_pic : null;
  const fontSize = (text) => {
    const maxSize = 40;
    if (text.length <= 30) return maxSize;
    else if (text.length > 30) return maxSize - (text.length - 30) * 0.2;
  };
  return (
    <View style={style.container}>
      <View style={[style.card]}>
        <View style={{ height: 300, width: 300 }}>
          {screen === "shared" && (
            <View
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                zIndex: 2000,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={{ uri: profilePic }}
                style={{
                  width: 75,
                  height: 75,
                  borderWidth: 3,
                  borderColor: secondary,
                  borderRadius: 15,
                }}
              />
            </View>
          )}
          <Image
            source={{
              uri: imageURI,
            }}
            style={style.image}
          />
        </View>
        <Text
          style={[
            { color: text, fontSize: fontSize(songName) },
            style.songName,
          ]}
        >
          {songName}
        </Text>
        <View
          style={{
            flexDirection: "row",
            gap: 7.5,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {explicit && (
            <Text
              style={[
                {
                  color: "#F2F2F2",
                  backgroundColor: "#ADADAD",
                  padding: 2,
                  paddingHorizontal: 7.5,
                  borderRadius: 5,
                  fontWeight: "semibold",
                },
              ]}
            >
              E
            </Text>
          )}
          <Text style={[{ color: text }, style.artistName]}>{artistNames}</Text>
        </View>
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
    borderTopRightRadius: 15,
  },
  time: {
    marginTop: 5,
  },
});
