import FilterModal from "@/components/FilterModal";
import PropertyCard from "@/components/PropertyCard";
import SearchChip from "@/components/SearchChip";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import { useFilterStore } from "@/store/filterStore";
import { useToastStore } from "@/store/toastStore";
import { Property } from "@/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Search() {
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const showToast = useToastStore((state) => state.show);

  const { openFilters } = useLocalSearchParams<{ openFilters?: string }>();

  useEffect(() => {
    if (openFilters === "true") {
      setShowFilters(true);
    }
  }, [openFilters]);

  const {
    search,
    type,
    bedrooms,
    minPrice,
    maxPrice,
    setSearch,
    setType,
    setBedrooms,
    setMinPrice,
    setMaxPrice,
  } = useFilterStore();

  const { value: debouncedSearch } = useDebounce(search, 400);

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, type, bedrooms, minPrice, maxPrice]);

  const activeFilterCount = [
    type !== null,
    bedrooms !== null,
    minPrice !== null,
    maxPrice !== null,
  ].filter(Boolean).length;

  const fetchResults = async () => {
    try {
      setLoading(true);
      let query = supabase.from("properties").select("*");
      if (debouncedSearch) {
        query = query.or(
          `title.ilike.%${debouncedSearch}%,city.ilike.%${debouncedSearch}%`,
        );
      }
      if (type) {
        query = query.eq("type", type);
      }
      if (bedrooms) {
        query = query.eq("bedrooms", bedrooms);
      }
      if (minPrice) {
        query = query.gte("price", minPrice);
      }
      if (maxPrice) {
        query = query.lte("price", maxPrice);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        showToast(error.message, "error");
        setResults([]);
        return;
      }

      setResults(data || []);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Something went wrong",
        "error",
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pb-3 pt-4">
        <Text className="mb-4 font-bold text-2xl text-gray-900">
          Find Property
        </Text>

        <View className="flex-row items-center gap-3">
          <View
            className="flex-1 flex-row items-center gap-3 rounded-2xl bg-white px-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.6,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
            <TextInput
              className="flex-1 py-3 text-gray-800"
              placeholder="Search by title or city..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
            />

            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            className={`h-12 w-12 items-center justify-center rounded-2xl ${
              activeFilterCount > 0 ? "bg-blue-600" : "bg-white"
            }`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={activeFilterCount > 0 ? "#FFF" : "#374151"}
            />

            {activeFilterCount > 0 && (
              <View className="absolute -right-1 -top-1 h-4 w-4 items-center justify-center rounded-full bg-red-500">
                <Text className="font-bold text-[9px] text-white">
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        {/* Filter Chips  */}
        {activeFilterCount > 0 && (
          <View className="mt-3 flex-row gap-2">
            {type && <SearchChip type={type} onClick={() => setType(null)} />}
            {bedrooms && (
              <SearchChip
                icon="bed-outline"
                type={bedrooms > 1 ? `${bedrooms} beds` : `${bedrooms} bed`}
                onClick={() => setBedrooms(null)}
              />
            )}
            {(minPrice !== null || maxPrice !== null) && (
              <SearchChip
                icon="cash-outline"
                type={
                  minPrice && maxPrice
                    ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
                    : minPrice
                      ? `From: ${formatPrice(minPrice)}`
                      : `Up to: ${formatPrice(maxPrice!)}`
                }
                onClick={() => {
                  setMinPrice(null);
                  setMaxPrice(null);
                }}
              />
            )}
          </View>
        )}
      </View>

      {/* Results  */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text className="mb-4 text-sm text-gray-400">
            {loading ? "Searching..." : `${results.length} Properties found`}
          </Text>
        }
        renderItem={({ item }) => <PropertyCard property={item} />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#2563EB" className="py-20" />
          ) : (
            <View className="items-center py-10">
              <Text className="text-gray-400">No Properties found</Text>
            </View>
          )
        }
      />

      {/* Filter Modal  */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </SafeAreaView>
  );
}
