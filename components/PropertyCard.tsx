import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Property } from "@/types";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatPrice } from "@/lib/utils";

export default function PropertyCard({
  property,
  onUnSave,
  showSave = false,
}: {
  property: Property;
  onUnsave?: () => void;
  showSave?: boolean;
}) {
  const router = useRouter();
  const isSaved = true;
  return (
    <TouchableOpacity
      className="flex-row bg-white rounded-2xl mb-4 overflow-hidden"
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
        className="w-28 h-28"
        resizeMode="cover"
      />

      <View className="flex-1 p-3 justify-between">
        <View>
          <Text className="text-sm font-bold text-gray-800 mb-1">
            {property.title}
          </Text>

          <View className="flex-row items-center gap-1">
            <Ionicons name="location-outline" size={11} color="#6B7280" />
            <Text className="text-xs text-gray-500" numberOfLines={1}>
              {property.city}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-blue-600 font-bold">
            {formatPrice(property.price)}
          </Text>

          {property.is_sold && (
            <View className="bg-red-50 px-2 py-0.5 rounded-full">
              <Text className="text-xs font-semibold text-red-500">Sold</Text>
            </View>
          )}

          <View className="flex-row gap-3">
            <View className="flex-row items-center gap-1">
              <Ionicons name="bed-outline" size={11} color="#6B7280" />
              <Text className="text-xs text-gray-500">{property.bedrooms}</Text>
            </View>

            <View className="flex-row items-center gap-1">
              <Ionicons name="bed-outline" size={11} color="#6B7280" />
              <Text className="text-xs text-gray-500">
                {property.area_sqft} ft²
              </Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity className="w-10 items-center pt-3">
        <Ionicons
          name={isSaved ? "heart" : "heart-outline"}
          size={18}
          color={isSaved ? "#EF4444" : "#9CA3AF"}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
