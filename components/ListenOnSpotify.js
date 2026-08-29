import { Image, Linking, Pressable, StyleSheet, Text } from "react-native";

export default function ListenOnSpotify({ link, theme }) {
  const { primary, secondary, tertiary, text } = theme;

  return (
    <Pressable
      style={[
        style.button,
        { backgroundColor: primary, borderColor: secondary },
      ]}
      onPress={async () => {
        await Linking.openURL(link);
      }}
    >
      <Image
        style={style.icon}
        source={
          text !== "#000000"
            ? require("../assets/images/Spotify_Primary_Logo_RGB_White.png")
            : require("../assets/images/Spotify_Primary_Logo_RGB_Black.png")
        }
      />
      <Text style={[style.buttonText, { color: text }]}>
        Listen on{"\n"} Spotify
      </Text>
    </Pressable>
  );
}

const style = StyleSheet.create({
  button: {
    marginTop: 20,
    padding: 15,
    paddingVertical: 7.5,
    borderWidth: 3,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  buttonText: {
    fontSize: 20,
  },
  icon: {
    height: 70,
    width: 70,
  },
});
