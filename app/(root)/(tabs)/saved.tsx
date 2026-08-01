import PropertyCard from "@/components/PropertyCard";
import { useSupabase } from "@/hooks/useSupabase";
import { useToastStore } from "@/store/toastStore";
import { Property } from "@/types";
import { useAuth } from "@clerk/expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SavedProperty {
  id: string;
  property_id: string;
  properties: Property;
}

export default function Saved() {
  const { userId } = useAuth();
  const authSupabase = useSupabase();
  const router = useRouter();
  const showToast = useToastStore((state) => state.show);

  const [saved, setSaved] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchSaved = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const { data, error } = await authSupabase
        .from("saved_properties")
        .select("id,property_id,properties(*)")
        .eq("user_clerk_id", userId)
        .order("id", { ascending: false });

      if (error) {
        showToast(error.message, "error");
        return;
      }
      if (data) {
        setSaved((data as unknown as SavedProperty[]) ?? []);
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Something went wrong",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchSaved();
    }, [fetchSaved]),
  );
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pb-3 pt-4">
        <Text className="font-bold text-2xl text-gray-900">Saved</Text>
        {!loading && (
          <Text className="mt-1 text-sm text-gray-400">
            {saved.length} {saved.length === 1 ? "property" : "properties"}{" "}
            saved
          </Text>
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PropertyCard
              property={item.properties}
              onUnsave={() =>
                setSaved((prev) => prev.filter((s) => s.id !== item.id))
              }
              showSave
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-24">
              <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-red-50">
                <Ionicons name="heart-outline" size={36} color="#EF4444" />
              </View>
              <Text className="mb-1 font-bold text-lg text-gray-700">
                No saved properties
              </Text>
              <Text className="px-8 text-center text-sm text-gray-400">
                Tap the heart icon on any property to save it here
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(root)/(tabs)/search")}
                className="mt-6 rounded-2xl bg-blue-600 px-6 py-3"
              >
                <Text className="font-semibold text-white">
                  Browse Properties
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
