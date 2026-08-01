import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Property } from "@/types";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatPrice } from "@/lib/utils";
import { useSavedProperty } from "@/hooks/useSavedProperty";

export default function PropertyCard({
  property,
  onUnsave,
  showSave = false,
}: {
  property: Property;
  onUnsave?: () => void;
  showSave?: boolean;
}) {
  const router = useRouter();
  const { isSaved, saveLoading, toggleSave } = useSavedProperty(
    property.id,
    onUnsave,
  );
  return (
    <TouchableOpacity
      className="mb-4 flex-row overflow-hidden rounded-2xl bg-white"
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
        className="h-28 w-28"
        resizeMode="cover"
      />

      <View className="flex-1 justify-between p-3">
        <View>
          <Text className="mb-1 font-bold text-sm text-gray-800">
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
          <Text className="font-bold text-xs text-blue-600">
            {formatPrice(property.price)}
          </Text>

          {property.is_sold && (
            <View className="rounded-full bg-red-50 px-2 py-0.5">
              <Text className="text-xs font-semibold text-red-500">Sold</Text>
            </View>
          )}

          <View className="flex-row gap-3">
            <View className="flex-row items-center gap-1">
              <Ionicons name="bed-outline" size={11} color="#6B7280" />
              <Text className="text-xs text-gray-500">{property.bedrooms}</Text>
            </View>

            <View className="flex-row items-center gap-1">
              <Ionicons name="expand-outline" size={11} color="#6B7280" />
              <Text className="text-xs text-gray-500">
                {property.area_sqft} ft²
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Save Button */}
      {/* {showSave && ( */}
      <TouchableOpacity
        onPress={toggleSave}
        disabled={saveLoading}
        className="w-10 items-center pt-3"
      >
        <Ionicons
          name={isSaved ? "heart" : "heart-outline"}
          size={18}
          color={isSaved ? "#EF4444" : "#9CA3AF"}
        />
      </TouchableOpacity>
      {/* )} */}
    </TouchableOpacity>
  );
}
