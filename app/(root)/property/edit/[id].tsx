import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSupabase } from "@/hooks/useSupabase";
import { Property } from "@/types";
import PropertyForm, {
  PropertyFormValues,
  PropertyType,
} from "@/components/PropertyForm";

export default function EditProperty() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const authSupabase = useSupabase();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      const { data, error } = await authSupabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching property:", error);
      } else {
        setProperty(data);
      }
      setLoading(false);
    };

    if (id) fetchProperty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!property) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-white">
        <Text className="text-gray-500">
          Property not found. Try again later.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-2 rounded-full bg-gray-100 px-4 py-2"
        >
          <Ionicons name="arrow-back" size={16} color="#111827" />
          <Text className="font-semibold text-gray-900">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSubmit = async (values: PropertyFormValues) => {
    return authSupabase.from("properties").update(values).eq("id", id);
  };

  return (
    <PropertyForm
      headerTitle="Edit Property"
      submitLabel="Save Changes"
      successMessage="Property updated successfully."
      initialValues={{
        title: property.title,
        description: property.description,
        price: property.price,
        type: property.type as PropertyType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area_sqft: property.area_sqft,
        address: property.address,
        city: property.city,
        latitude: property.latitude,
        longitude: property.longitude,
        isFeatured: property.is_featured,
        images: property.images,
      }}
      onSubmit={handleSubmit}
      onSuccess={() => router.replace(`/(root)/property/${id}`)}
      onBack={() => router.back()}
    />
  );
}
