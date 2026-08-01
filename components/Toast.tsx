import { useToastStore } from "@/store/toastStore";
import React, { useEffect } from "react";
import { Text } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  error: "bg-red-600",
  success: "bg-green-600",
  info: "bg-gray-900",
};

export default function Toast() {
  const { toast, hide } = useToastStore();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(hide, 3000);
    return () => clearTimeout(timer);
  }, [toast, hide]);

  if (!toast) return null;

  return (
    <SafeAreaView
      pointerEvents="none"
      className="absolute top-0 left-0 right-0 items-center px-5"
    >
      <Animated.View
        key={toast.id}
        entering={FadeInDown}
        exiting={FadeOutUp}
        className={`mt-2 px-4 py-3 rounded-xl w-full ${COLORS[toast.type]}`}
      >
        <Text className="text-white text-sm font-medium text-center">
          {toast.message}
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}
