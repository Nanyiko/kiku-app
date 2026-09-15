import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Dropdown({
  theme,
  labels,
  values,
  defaultValue,
  handleClick,
}) {
  defaultValue = defaultValue ?? values[0];
  const defaultLabel = labels[values.indexOf(defaultValue)];
  const { primary, secondary, tertiary, text } = theme;
  const [focused, setFocused] = useState(false);
  const [selected, setSelected] = useState({
    label: defaultLabel,
    value: defaultValue,
  });

  return (
    <View>
      {focused && (
        <View style={style.optionsContainer}>
          {labels.map((label, index) => (
            <Pressable
              key={index}
              style={[style.option, { backgroundColor: secondary }]}
            >
              <Text style={[style.optionText, { color: text }]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const style = StyleSheet.create({
  container: {
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
  optionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
    width: "100%",
    padding: 20,
    paddingTop: 0,
  },
  option: {
    padding: 15,
  },
  optionText: {},
});
