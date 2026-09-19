import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function SegmentedControl({
  labels,
  theme,
  handleClick,
  values,
  size,
}) {
  const { primary, secondary, tertiary, text } = theme;
  const [selected, setSelected] = useState(labels[0]);
  const fontSizes = {
    medium: 16,
    "x-large": 35,
  };
  return (
    <View style={[{ backgroundColor: primary }, styles.container]}>
      {labels.map((label, index) => (
        <Pressable
          key={index}
          onPress={() => {
            setSelected(label);
            handleClick(values[index]);
          }}
          style={[
            styles.button,
            selected === label && { backgroundColor: tertiary },
            { width: `${100 / labels.length}%` },
          ]}
        >
          <Text
            style={[
              {
                color: text,
                fontSize: fontSizes[size],
                fontWeight: "bold",
              },
            ]}
          >
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    margin: 5,
    marginHorizontal: 20,
    borderRadius: 15,
  },
  button: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
});
