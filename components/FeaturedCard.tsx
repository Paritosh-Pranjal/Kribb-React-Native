import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Property } from "@/types";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatPrice } from "@/lib/utils";

export default function FeatureCard({ property }: { property: Property }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      className="mr-2 w-72 overflow-hidden rounded-3xl bg-white"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        opacity: property.is_sold ? 0.5 : 1,
      }}
      onPress={() => router.push(`/(root)/property/${property.id}`)}
    >
      <Image
        source={{ uri: property.images[0] }}
        className="h-44 w-full"
        resizeMode="cover"
      />
      <View className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1">
        <Text className="text-xs font-semibold capitalize text-blue-600">
          {property.type}
        </Text>
      </View>

      {property.is_sold && (
        <View className="absolute right-3 top-3 rounded-full bg-red-500 px-3 py-1">
          <Text className="text-xs font-semibold text-white">Sold</Text>
        </View>
      )}

      <View className="p-4">
        <Text className="mb-1 font-bold text-base text-gray-800">
          {property.title}
        </Text>

        <View className="mb-3 flex-row items-center gap-1">
          <Ionicons name="location-outline" size={13} color="6B7280" />
          <Text className="text-xs text-gray-500" numberOfLines={1}>
            {property.address}, {property.city}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="font-bold text-base text-blue-600">
            {formatPrice(property.price)}
          </Text>

          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1">
              <Ionicons name="bed-outline" size={13} color="#6B7280" />
              <Text className="text-xs text-gray-500">{property.bedrooms}</Text>
            </View>

            <View className="flex-row items-center gap-1">
              <Ionicons name="water-outline" size={13} color="#6B7280" />
              <Text className="text-xs text-gray-500">
                {property.bathrooms}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
