import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function SegmentedControl({ items, theme, handleClick, size }) {
  const labels = [];
  const values = [];
  for (let item of items) {
    labels.push(item.label);
    values.push(item.value);
  }
  const { primary, secondary, tertiary, text } = theme;
  const [selected, setSelected] = useState(labels[0]);
  const fontSizes = {
    medium: 16,
    "x-large": 35,
  };
  return (
    <View style={[{ backgroundColor: primary }, styles.container]}>
      {items.map((item, index) => (
        <Pressable
          key={index}
          onPress={() => {
            setSelected(item.label);
            handleClick(item.value);
          }}
          style={[
            styles.button,
            selected === item.label && { backgroundColor: tertiary },
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
            {item.label}
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
