import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function SegmentedControl({
  values,
  theme,
  handleClick,
  terms,
}) {
  const { primary, secondary, tertiary, text } = theme;
  const [selected, setSelected] = useState(values[0]);
  return (
    <View style={[{ backgroundColor: primary }, styles.container]}>
      {values.map((value, index) => (
        <Pressable
          key={index}
          onPress={() => {
            setSelected(value);
            handleClick(terms[index]);
          }}
          style={[
            styles.button,
            selected === value && { backgroundColor: tertiary },
          ]}
        >
          <Text style={[{ color: text }]}>{value}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    margin: 5,
    borderRadius: 15,
  },
  button: {
    padding: 20,
    margin: 2,
    borderRadius: 15,
  },
});
