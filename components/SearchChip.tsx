import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";

interface SearchChipProps {
  type: React.ReactElement | string | null;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  onClick: () => void;
}

export default function SearchChip({ type, icon, onClick }: SearchChipProps) {
  return (
    <View className="flex-row items-center gap-1 px-3 py-1 bg-blue-200 rounded-full">
      {icon && <Ionicons name={icon} size={12} color="#1D4ED8" />}
      <Text className="text-blue-700 text-xs font-semibold capitalize">
        {type}
      </Text>
      <TouchableOpacity onPress={onClick}>
        <Ionicons name="close" size={12} color="#1D4ED8" />
      </TouchableOpacity>
    </View>
  );
}
