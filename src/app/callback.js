import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";

export default function Callback() {
  const { code, error } = useLocalSearchParams();

  useEffect(() => {
    if (code) {
      router.replace("/");
    }
  }, [code]);

  return null;
}
