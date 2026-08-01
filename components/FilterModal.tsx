import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { PropertyType, useFilterStore } from "@/store/filterStore";
import Ionicons from "@expo/vector-icons/Ionicons";

const TYPES: { label: string; value: PropertyType }[] = [
  { label: "All", value: null },
  { label: "Apartment", value: "apartment" },
  { label: "House", value: "house" },
  { label: "Villa", value: "villa" },
  { label: "Studio", value: "studio" },
];

const BEDS = [
  { label: "Any", value: null },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4+", value: 4 },
];

const PRICE_PRESETS = [
  { label: "Under ₹50L", min: null, max: 5000000 },
  { label: "₹50L – ₹1Cr", min: 5000000, max: 10000000 },
  { label: "₹1Cr – ₹2Cr", min: 10000000, max: 20000000 },
  { label: "Above ₹2Cr", min: 20000000, max: null },
];

const chip = (active: boolean) =>
  `px-4 py-2 rounded-full border ${
    active ? "bg-blue-600 border-blue-600" : "bg-white border-gray-200"
  }`;

const chipText = (active: boolean) =>
  `text-sm font-semibold ${active ? "text-white" : "text-gray-600"}`;

export default function FilterModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const {
    type,
    bedrooms,
    minPrice,
    maxPrice,
    setType,
    setBedrooms,
    setMinPrice,
    setMaxPrice,
    resetFilters,
  } = useFilterStore();

  type Draft = {
    type: PropertyType;
    bedrooms: number | null;
    minPrice: string;
    maxPrice: string;
  };

  const toDraft = (): Draft => ({
    type,
    bedrooms,
    minPrice: minPrice ? String(minPrice) : "",
    maxPrice: maxPrice ? String(maxPrice) : "",
  });

  const [draft, setDraft] = useState<Draft>(toDraft);

  useEffect(() => {
    if (visible) {
      setDraft(toDraft());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const draftMinPrice = draft.minPrice ? Number(draft.minPrice) : null;
  const draftMaxPrice = draft.maxPrice ? Number(draft.maxPrice) : null;

  const activeCount = [
    draft.type,
    draft.bedrooms,
    draftMinPrice,
    draftMaxPrice,
  ].filter((v) => v !== null).length;

  function handleApply() {
    setType(draft.type);
    setBedrooms(draft.bedrooms);
    setMinPrice(draftMinPrice);
    setMaxPrice(draftMaxPrice);
    onClose();
  }

  function handleReset() {
    setDraft({ type: null, bedrooms: null, minPrice: "", maxPrice: "" });
    resetFilters();
    onClose();
  }

  const shadow = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50">
        <View className="bg-4 flex-row items-center justify-between border-b border-gray-100 bg-white px-5 pt-6">
          <TouchableOpacity onPress={onClose} className="p-1">
            <Ionicons name="close" size={22} color="#374151" />
          </TouchableOpacity>

          <Text className="font-bold text-lg text-gray-900">Filters</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text className="text-sm font-semibold text-blue-600">Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="mb-3 font-bold text-base text-gray-800">
            Property Type
          </Text>
          <View className="mb-6 flex-row flex-wrap gap-2">
            {TYPES.map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => setDraft((d) => ({ ...d, type: item.value }))}
                className={chip(draft.type === item.value)}
                style={shadow}
              >
                <Text className={chipText(draft.type === item.value)}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="mb-3 font-bold text-base text-gray-800">
            Bedrooms
          </Text>
          <View className="mb-6 flex-row flex-wrap gap-2">
            {BEDS.map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={() =>
                  setDraft((d) => ({ ...d, bedrooms: item.value }))
                }
                className={`flex-1 items-center rounded-2xl border py-3 ${chip(draft.bedrooms === item.value)}`}
                style={shadow}
              >
                <Text
                  className={`font-bold text-sm ${chipText(draft.bedrooms === item.value)}`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="mb-3 font-bold text-base text-gray-800">
            Price Range (₹)
          </Text>
          <View className="mb-3 flex-row gap-3">
            {[
              {
                label: "Min Price",
                value: draft.minPrice,
                onChange: (text: string) =>
                  setDraft((d) => ({ ...d, minPrice: text })),
                placeholder: "0",
              },
              {
                label: "Max Price",
                value: draft.maxPrice,
                onChange: (text: string) =>
                  setDraft((d) => ({ ...d, maxPrice: text })),
                placeholder: "Any",
              },
            ].map(({ label, value, onChange, placeholder }) => (
              <View key={label} className="flex-1">
                <Text className="mb-1.5 font-medium text-xs text-gray-500">
                  {label}
                </Text>
                <View
                  className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-3"
                  style={shadow}
                >
                  <Text className="mr-1 text-sm text-gray-400">₹</Text>
                  <TextInput
                    className="flex-1 py-3 text-gray-800"
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              </View>
            ))}
          </View>

          <View className="mb-6 flex-row flex-wrap gap-2">
            {PRICE_PRESETS.map((item) => {
              const active =
                draftMinPrice === item.min && draftMaxPrice === item.max;
              return (
                <TouchableOpacity
                  key={item.label}
                  onPress={() =>
                    setDraft((d) => ({
                      ...d,
                      minPrice: item.min ? String(item.min) : "",
                      maxPrice: item.max ? String(item.max) : "",
                    }))
                  }
                  className={`rounded-full border px-3 py-1.5 ${
                    active
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <Text
                    className={`font-medium text-sm ${active ? "text-blue-600" : "text-gray-500"}`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View className="border-t border-gray-100 bg-white px-5 pb-8 pt-4">
          <TouchableOpacity
            onPress={handleApply}
            className="items-center rounded-2xl bg-blue-600 py-4"
            style={{
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="font-bold text-base text-white">
              Apply Filters {activeCount > 0 ? `(${activeCount})` : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
