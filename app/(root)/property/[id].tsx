import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/expo";
import { useUserStore } from "@/store/userStore";
import { useSupabase } from "@/hooks/useSupabase";
import { Property } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSavedProperty } from "@/hooks/useSavedProperty";
import { formatPrice } from "@/lib/utils";
import { WebView } from "react-native-webview";
import ImageViewing from "react-native-image-viewing";

const { width } = Dimensions.get("window");
const ADMIN_PHONE = "916389868183";

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useAuth();
  const router = useRouter();
  const isAdmin = useUserStore((state) => state.isAdmin);

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  const authSupabase = useSupabase();
  const { isSaved, toggleSave, saveLoading } = useSavedProperty(id ?? "");

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await authSupabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching property details:", error);
      } else {
        setProperty(data);
      }
    } catch (error) {
      console.error("Error fetching property details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPropertyDetails();
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
      <SafeAreaView className="flex-1 items-center justify-center bg-white gap-4">
        <Text className="text-gray-500">
          Property not found. Try again later.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-2 bg-gray-100 px-4 py-2 rounded-full"
        >
          <Ionicons name="arrow-back" size={16} color="#111827" />
          <Text className="text-gray-900 font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const isLongDesc = (property.description || "").length > 150;
  const displayDesc =
    expanded || !isLongDesc
      ? property.description
      : `${property.description?.slice(0, 150)}...`;

  const propertyLatitude = Number(property.latitude);
  const propertyLongitude = Number(property.longitude);
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    propertyLongitude - 0.003
  }%2C${propertyLatitude - 0.003}%2C${propertyLongitude + 0.003}%2C${
    propertyLatitude + 0.003
  }&layer=mapnik&marker=${propertyLatitude}%2C${propertyLongitude}`;

  function handleContact() {
    const message = `Hi! I'm interested in the property: ${property?.title}`;
    const url = `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(
      message,
    )}`;
    Linking.openURL(url);
  }

  const handleToggleSold = () => {
    const markingSold = !property.is_sold;

    Alert.alert(
      markingSold ? "Mark as Sold" : "Mark as Available",
      "Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: markingSold ? "Mark Sold" : "Mark Available",
          onPress: async () => {
            await authSupabase
              .from("properties")
              .update({ is_sold: markingSold })
              .eq("id", id);
            setProperty((prev) =>
              prev ? { ...prev, is_sold: markingSold } : prev,
            );
          },
        },
      ],
    );
  };

  const handleDelete = () => {
    Alert.alert("Delete Property", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await authSupabase.from("properties").delete().eq("id", id);
          router.replace("/(root)/(tabs)");
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        // contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View>
          <View style={{ opacity: property.is_sold ? 0.5 : 1 }}>
            <FlatList
              data={property.images}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setImageViewerVisible(true)}>
                  <Image
                    source={{ uri: item }}
                    style={{ width: width, height: 300 }}
                  />
                </TouchableOpacity>
              )}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={onScroll}
            />
          </View>
          {/* Image Count Badge  */}
          <View className="absolute bottom-3 right-4 bg-black/50 px-3 py-1 rounded-full">
            <Text className="text-white text-sm">
              {activeIndex + 1} / {property.images.length}
            </Text>
          </View>
        </View>

        <SafeAreaView className="absolute top-0 left-0 w-full">
          <View className="flex-row items-center justify-between px-4 pt-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-md"
            >
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>

            <View className="flex-row items-center gap-2">
              {isAdmin && (
                <TouchableOpacity
                  onPress={() => router.push(`/(root)/property/edit/${id}`)}
                  className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-md"
                >
                  <Ionicons name="create-outline" size={19} color="#111827" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={toggleSave}
                disabled={saveLoading}
                className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-md"
              >
                <Ionicons
                  name={isSaved ? "heart" : "heart-outline"}
                  size={20}
                  color={isSaved ? "#EF4444" : "#111827"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>

        <View className="flex gap-2 px-5 pt-5 pb-8">
          <View className="self-start px-3 py-1 bg-blue-50 rounded-full">
            <Text className="capitalize text-blue-600 text-xs font-semibold">
              {property.type}
            </Text>
          </View>

          <Text className="text-2xl font-bold">{property.title}</Text>
          <Text className="text-xl font-bold text-blue-600">
            {formatPrice(property.price)}
          </Text>

          <View className="flex flex-row items-center justify-between gap-4 py-4">
            <SpectItem
              icon="bed-outline"
              label="Beds"
              value={property.bedrooms.toString()}
            />
            <SpectItem
              icon="water-outline"
              label="Baths"
              value={property.bathrooms.toString()}
            />
            <SpectItem
              icon="expand-outline"
              label="Area"
              value={`${property.area_sqft} sq ft²`}
            />
            <SpectItem icon="home-outline" label="Type" value={property.type} />
          </View>

          <Text className="text-base font-bold text-gray-900 mb-2">
            Description
          </Text>
          <Text className="text-gray-500 text-sm leading-6 mb-1">
            {displayDesc}
          </Text>
          {isLongDesc && (
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
              <Text className="text-blue-500 text-sm font-semibold">
                {expanded ? "Show Less" : "Read More"}
              </Text>
            </TouchableOpacity>
          )}

          <Text className="text-base font-bold text-gray-900 mb-2">
            Location
          </Text>
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text className="text-gray-500 text-sm flex-1">
              {property.address}, {property.city}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            className="rounded-2xl overflow-hidden mb-6"
            style={{ height: 200 }}
            onPress={() =>
              router.push({
                pathname: "/(root)/property/map",
                params: {
                  latitude: property.latitude,
                  longitude: property.longitude,
                  title: property.title,
                  address: `${property.address}, ${property.city}`,
                },
              })
            }
          >
            <WebView
              source={{ uri: mapUrl }}
              style={{ flex: 1 }}
              scrollEnabled={false}
              pointerEvents="none"
            />
            <View className="flex flex-row items-center absolute bottom-3 right-3 bg-white/90 px-3 py-1 rounded-full gap-1">
              <Ionicons name="expand-outline" size={12} color="#374151" />
              <Text>Tap to expand</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-green-500 flex flex-row items-center justify-center py-4 rounded-full gap-2 mb-3"
            onPress={handleContact}
          >
            <Ionicons name="logo-whatsapp" size={20} color="white" />
            <Text className="font-semibold text-white text-base">
              Contact Agent
            </Text>
          </TouchableOpacity>

          {isAdmin && (
            <View className="flex-row justify-center gap-3">
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center gap-1.5 bg-amber-50 border border-amber-200 py-4 rounded-2xl"
                onPress={handleToggleSold}
              >
                <Ionicons
                  name={
                    property.is_sold
                      ? "refresh-outline"
                      : "checkmark-circle-outline"
                  }
                  size={18}
                  color="#D97706"
                />
                <Text
                  className="text-amber-600 font-semibold"
                  numberOfLines={1}
                >
                  {property.is_sold ? "Mark Available" : "Mark Sold"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center gap-1.5 bg-red-50 border border-red-200 py-4 rounded-2xl"
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                <Text className="text-red-600 font-semibold">Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <ImageViewing
        images={property.images.map((uri) => ({ uri }))}
        imageIndex={activeIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />
    </View>
  );
}

function SpectItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex gap-1 items-center">
      <Ionicons name={icon} size={20} color="#2563EB" />
      <Text className="text-gray-900 font-bold text-sm">{value}</Text>
      <Text className="text-gray-400 text-xs">{label}</Text>
    </View>
  );
}
