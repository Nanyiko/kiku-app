import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useSharedValue, withSpring } from "react-native-reanimated";

export default function ThemeSelect() {
  const router = useRouter();

  const [selectedTheme, setSelectedTheme] = useState(0);

  const Option = ({ id, primary, tertiary }) => {
    const selected = selectedTheme === id;
    const borderWidth = useSharedValue(selectedTheme === id ? 10 : 0);

    const border = selected
      ? { borderWidth: borderWidth, margin: 0, borderColor: tertiary }
      : { borderWidth: borderWidth, margin: 10 };
    return (
      <Animated.View
        style={[
          {
            marginHorizontal: 10,
            borderRadius: 35,
          },
          border,
        ]}
      >
        <Pressable
          onPress={() => {
            setSelectedTheme(id);
            borderWidth.value = withSpring(selectedTheme === id ? 10 : 0);
          }}
          style={{
            height: 50,
            width: 50,
            borderRadius: 25,
            backgroundColor: primary,
          }}
        ></Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={[style.container]}>
      <View style={style.headerContainer}>
        <Text style={style.headerText}>Select the theme</Text>
      </View>
      <View style={style.optionsContainer}>
        <Option id={0} primary="#C39BD3" tertiary="#D7A6C7" />
        <Option id={1} primary="#B80F0A" tertiary="#E5B700" />
        <Option id={2} primary="#F4C20D" tertiary="#C5D84E" />
        <Option id={3} primary="#F8F5E7" tertiary="#FFFFFF" />
      </View>
      <Pressable
        style={style.button}
        onPress={() => {
          router.replace("/Home");
          AsyncStorage.setItem("theme", `${selectedTheme}`);
        }}
      >
        <Text style={style.buttonText}>Next</Text>
      </Pressable>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {},
  headerText: {},
  optionsContainer: {
    display: "flex",
    flexDirection: "row",
  },

  button: {
    margin: 30,
    borderWidth: 0.3,
    borderRadius: 10,
  },
  buttonText: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
