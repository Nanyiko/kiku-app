import { StyleSheet, Text, View } from "react-native";

export default function ThemeSelect() {
  return (
    <View style={style.container}>
      <Text>Select the theme</Text>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
