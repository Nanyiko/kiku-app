import { View, Text, StyleSheet, Image, FlatList } from "react-native";

export default function Podium({ data, theme, type }) {
  const { primary, secondary, tertiary, text } = theme;

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => {
        const artistNames =
          type == "track"
            ? (item?.artists
                ?.map((artist) => artist?.name)
                .filter(Boolean)
                .join(", ") ?? "Unknown artist")
            : null;
        return (
          <View
            key={item?.id}
            style={{
              width: 100,
              margin: 10,
              alignItems: "center",
            }}
          >
            <View
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                zIndex: 3000,
                width: 30,
                height: 30,
                backgroundColor: primary,
                borderWidth: 3,
                borderRadius: 15,
                borderColor: secondary,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: text, fontWeight: "bold" }}>
                {data.indexOf(item) + 1}
              </Text>
            </View>
            <Image
              source={{
                uri:
                  type == "artist"
                    ? item?.images[0]?.url
                    : item?.album?.images[0]?.url,
              }}
              style={{
                width: 100,
                height: 125,
                borderWidth: 5,
                borderColor: secondary,
                borderRadius: 20,
              }}
            />
            <Text
              style={{
                color: text,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {item?.name}
            </Text>
            {type == "track" && (
              <Text
                style={{ fontWeight: "300", textAlign: "center", color: text }}
              >
                {artistNames}
              </Text>
            )}
          </View>
        );
      }}
      horizontal
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={() => {
        return <Text>Wow</Text>;
      }}
    />
  );
}
