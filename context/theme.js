import AsyncStorage from "@react-native-async-storage/async-storage";

const themeOptions = {
  0: {
    primary: "#C39BD3",
    secondary: "#B892D4",
    tertiary: "#D7A6C7",
  },
  1: {
    primary: "#B80F0A",
    secondary: "#700D17",
    tertiary: "#E5B700",
  },
  2: {
    primary: "#F4C20D",
    secondary: "#F28C28",
    tertiary: "#C5D84E",
  },
  3: {
    primary: "#F8F5E7",
    secondary: "#FFFFFF",
    tertiary: "#D7E4C2",
  },
};

const defaultTheme = {
  primary: "#C39BD3",
  secondary: "#B892D4",
  tertiary: "#D7A6C7",
};

export const getSelectedTheme = async () => {
  try {
    const value = await AsyncStorage.getItem("theme");
    const themeKey = Number(value);

    const selectedTheme = themeOptions[themeKey] || defaultTheme;

    console.log("stored theme key:", value);
    console.log("selected theme:", selectedTheme);

    return selectedTheme;
  } catch (error) {
    console.warn("Failed to load theme:", error);
    return defaultTheme;
  }
};

export default getSelectedTheme;
