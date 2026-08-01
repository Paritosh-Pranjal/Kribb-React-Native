import { View, Text, TouchableOpacity, Linking } from "react-native";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { WebView } from "react-native-webview";

export default function MapScreen() {
  const { latitude, longitude, title, address } = useLocalSearchParams<{
    latitude: string;
    longitude: string;
    title: string;
    address: string;
  }>();
  const router = useRouter();

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    lng - 0.003
  }%2C${lat - 0.003}%2C${lng + 0.003}%2C${
    lat + 0.003
  }&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-start justify-between border-b border-gray-100 px-4 py-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 shadow-md"
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <View className="mx-3 flex-1">
          <Text className="font-bold text-lg text-gray-900">{title}</Text>
          <Text className="text-xs text-gray-400" numberOfLines={1}>
            {address}
          </Text>
        </View>

        <TouchableOpacity
          className="flex-row items-center gap-1 rounded-full bg-gray-100 px-3 py-2 shadow-md"
          onPress={() => {
            Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`);
          }}
        >
          <Ionicons name="navigate-outline" size={20} color="#111827" />
          <Text>Google Maps</Text>
        </TouchableOpacity>
      </View>

      <WebView source={{ uri: mapUrl }} style={{ flex: 1 }} />
    </SafeAreaView>
  );
}
