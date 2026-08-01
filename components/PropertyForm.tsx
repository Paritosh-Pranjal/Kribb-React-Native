import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

const TYPES = ["apartment", "house", "villa", "studio"] as const;
export type PropertyType = (typeof TYPES)[number];

const MIN_PRICE = 1;
const MAX_PRICE = 999_999_999;

const inputClass =
  "bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-800";
const labelClass = "text-sm font-semibold text-gray-700 mb-1.5";
const sectionClass = "mb-5";

interface FormState {
  title: string;
  description: string;
  price: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  areaSqft: string;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  isFeatured: boolean;
  images: string[];
  localImages: string[];
}

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  price: "",
  type: "apartment",
  bedrooms: 1,
  bathrooms: 1,
  areaSqft: "",
  address: "",
  city: "",
  latitude: "",
  longitude: "",
  isFeatured: false,
  images: [],
  localImages: [],
};

export interface PropertyFormInitialValues {
  title?: string;
  description?: string;
  price?: number | string;
  type?: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  area_sqft?: number | string;
  address?: string;
  city?: string;
  latitude?: number | string;
  longitude?: number | string;
  isFeatured?: boolean;
  images?: string[];
}

export interface PropertyFormValues {
  title: string;
  description: string;
  price: number;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  images: string[];
  is_featured: boolean;
}

function toFormState(initial?: PropertyFormInitialValues): FormState {
  if (!initial) return EMPTY_FORM;
  return {
    title: initial.title ?? "",
    description: initial.description ?? "",
    price: initial.price !== undefined ? String(initial.price) : "",
    type: initial.type ?? "apartment",
    bedrooms: initial.bedrooms ?? 1,
    bathrooms: initial.bathrooms ?? 1,
    areaSqft: initial.area_sqft !== undefined ? String(initial.area_sqft) : "",
    address: initial.address ?? "",
    city: initial.city ?? "",
    latitude: initial.latitude !== undefined ? String(initial.latitude) : "",
    longitude: initial.longitude !== undefined ? String(initial.longitude) : "",
    isFeatured: initial.isFeatured ?? false,
    images: initial.images ?? [],
    localImages: initial.images ?? [],
  };
}

interface PropertyFormProps {
  headerTitle: string;
  submitLabel: string;
  successTitle?: string;
  successMessage: string;
  initialValues?: PropertyFormInitialValues;
  onSubmit: (values: PropertyFormValues) => Promise<{ error?: unknown } | void>;
  onSuccess: () => void;
  onBack?: () => void;
}

export default function PropertyForm({
  headerTitle,
  submitLabel,
  successTitle = "Success! 🎉",
  successMessage,
  initialValues,
  onSubmit,
  onSuccess,
  onBack,
}: PropertyFormProps) {
  const authSupabase = useSupabase();

  const [form, setForm] = useState<FormState>(() => toFormState(initialValues));

  // Loading states
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const updateForm = (fields: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...fields }));
  };

  // ─── Image Picker ──────────────────────────────────────────
  const handlePickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.7,
      base64: true,
      selectionLimit: 6,
    });

    if (result.canceled) return;

    setUploadingImages(true);

    const uploadedUrls: string[] = [];
    const previewUris: string[] = [];

    for (const asset of result.assets) {
      try {
        const filename = `property_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}.jpg`;

        const base64 = asset.base64!;
        const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

        const { error } = await authSupabase.storage
          .from("property-images")
          .upload(filename, buffer, {
            contentType: "image/jpeg",
            upsert: false,
          });

        if (error) throw error;

        const { data: urlData } = authSupabase.storage
          .from("property-images")
          .getPublicUrl(filename);

        uploadedUrls.push(urlData.publicUrl);
        previewUris.push(asset.uri);
      } catch (err) {
        console.error("Upload error:", err);
        Alert.alert("Upload Failed", "One or more images failed to upload.");
      }
    }

    updateForm({
      images: [...form.images, ...uploadedUrls],
      localImages: [...form.localImages, ...previewUris],
    });
    setUploadingImages(false);
  };

  const handleRemoveImage = (index: number) => {
    updateForm({
      images: form.images.filter((_, i) => i !== index),
      localImages: form.localImages.filter((_, i) => i !== index),
    });
  };

  const handleDetectLocation = async () => {
    setDetectingLocation(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to detect coordinates",
        );
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      updateForm({
        latitude: String(location.coords.latitude),
        longitude: String(location.coords.latitude),
      });
    } catch {
      Alert.alert("Error", "Could not detect location. Enter Manually");
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim())
      return Alert.alert("Validation", "Title is required.");

    if (!form.description.trim())
      return Alert.alert("Validation", "Description is required.");

    if (!form.price.trim())
      return Alert.alert("Validation", "Price is required.");

    const priceNum = Number(form.price);
    if (isNaN(priceNum) || priceNum < MIN_PRICE)
      return Alert.alert("Validation", "Price must be greater than ₹0.");
    if (priceNum > MAX_PRICE)
      return Alert.alert(
        "Validation",
        `Price cannot exceed ₹${MAX_PRICE.toLocaleString("en-IN")}.`,
      );

    if (!form.areaSqft.trim())
      return Alert.alert("Validation", "Area is required.");
    if (isNaN(Number(form.areaSqft)) || Number(form.areaSqft) <= 0)
      return Alert.alert("Validation", "Area must be a valid number.");

    if (!form.address.trim())
      return Alert.alert("Validation", "Address is required.");
    if (!form.city.trim())
      return Alert.alert("Validation", "City is required.");

    if (!form.latitude.trim() || !form.longitude.trim())
      return Alert.alert(
        "Validation",
        "Latitude and longitude are required. Use Detect Location or enter them manually.",
      );
    if (isNaN(Number(form.latitude)) || isNaN(Number(form.longitude)))
      return Alert.alert(
        "Validation",
        "Latitude and longitude must be valid numbers.",
      );

    if (form.images.length === 0)
      return Alert.alert("Validation", "Please upload at least one image.");

    setSubmitting(true);

    const result = await onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      price: priceNum,
      type: form.type,
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
      area_sqft: Number(form.areaSqft),
      address: form.address.trim(),
      city: form.city.trim(),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      images: form.images,
      is_featured: form.isFeatured,
    });

    setSubmitting(false);

    if (result && "error" in result && result.error) {
      Alert.alert("Error", "Failed to save property. Please try again.");
      console.error(result.error);
      return;
    }

    Alert.alert(successTitle, successMessage, [
      { text: "OK", onPress: onSuccess },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header  */}
        <View className="flex-row items-center gap-3 px-5 pb-3 pt-4">
          {onBack && (
            <TouchableOpacity
              onPress={onBack}
              className="h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
            >
              <Ionicons name="arrow-back" size={20} color="#111827" />
            </TouchableOpacity>
          )}
          <Text className="flex-1 font-bold text-2xl text-gray-900">
            {headerTitle}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className={sectionClass}>
            <Text className={labelClass}>
              Photos <Text className="text-red-500">*</Text>{" "}
              <Text className="font-normal text-gray-400">(up to 6)</Text>
            </Text>

            <View className="flex-row flex-wrap gap-3">
              {form.localImages.map((uri, index) => (
                <View key={index} className="relative">
                  <Image
                    source={{ uri }}
                    className="h-24 w-24 rounded-2xl"
                    resizeMode="cover"
                  />
                  {index === 0 && (
                    <View className="absolute left-1 top-1 rounded-full bg-blue-600 px-1.5 py-0.5">
                      <Text className="font-bold text-[9px] text-white">
                        COVER
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(index)}
                    className="absolute -right-2 -top-2 h-5 w-5 items-center justify-center rounded-full bg-red-500"
                  >
                    <Ionicons name="close" size={11} color="white" />
                  </TouchableOpacity>
                </View>
              ))}

              {form.localImages.length < 6 && (
                <TouchableOpacity
                  onPress={handlePickImages}
                  disabled={uploadingImages}
                  className="h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white"
                >
                  {uploadingImages ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                  ) : (
                    <>
                      <Ionicons
                        name="camera-outline"
                        size={22}
                        color="#9CA3AF"
                      />
                      <Text className="mt-1 text-xs text-gray-400">Add</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Basic Info */}
          <View className={sectionClass}>
            <Text className={labelClass}>
              Title <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className={inputClass}
              placeholder="e.g. Modern 3BHK in Bandra"
              placeholderTextColor="#9CA3AF"
              value={form.title}
              onChangeText={(v) => updateForm({ title: v })}
            />
          </View>

          <View className={sectionClass}>
            <Text className={labelClass}>
              Description <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className={`${inputClass} h-24`}
              placeholder="Describe the property..."
              placeholderTextColor="#9CA3AF"
              value={form.description}
              onChangeText={(v) => updateForm({ description: v })}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Price */}
          <View className={sectionClass}>
            <Text className={labelClass}>
              Price (₹) <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className={inputClass}
              placeholder="e.g. 5000000"
              placeholderTextColor="#9CA3AF"
              value={form.price}
              onChangeText={(v) => updateForm({ price: v })}
              keyboardType="numeric"
            />
            <Text className="ml-1 mt-1.5 text-xs text-gray-400">
              Valid range: ₹1 – ₹{MAX_PRICE.toLocaleString("en-IN")}
            </Text>
          </View>

          {/* Property Type */}
          <View className={sectionClass}>
            <Text className={labelClass}>Property Type</Text>
            <View className="flex-row flex-wrap gap-2">
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => updateForm({ type: t })}
                  className={`rounded-full border px-4 py-2 ${
                    form.type === t
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold capitalize ${
                      form.type === t ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bedrooms / Bathrooms */}
          <View className="mb-5 flex-row gap-4">
            <Counter
              label="Bedrooms"
              value={form.bedrooms}
              onChange={(v) => updateForm({ bedrooms: v })}
            />
            <Counter
              label="Bathrooms"
              value={form.bathrooms}
              onChange={(v) => updateForm({ bathrooms: v })}
            />
          </View>

          <View className={sectionClass}>
            <Text className={labelClass}>
              Area (sq ft) <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className={inputClass}
              placeholder="e.g. 1200"
              placeholderTextColor="#9CA3AF"
              value={form.areaSqft}
              onChangeText={(v) => updateForm({ areaSqft: v })}
              keyboardType="numeric"
            />
          </View>

          {/* Location */}
          <View className={sectionClass}>
            <Text className={labelClass}>
              Address <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className={inputClass}
              placeholder="Street address"
              placeholderTextColor="#9CA3AF"
              value={form.address}
              onChangeText={(v) => updateForm({ address: v })}
            />
          </View>

          <View className={sectionClass}>
            <Text className={labelClass}>
              City <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className={inputClass}
              placeholder="e.g. Mumbai"
              placeholderTextColor="#9CA3AF"
              value={form.city}
              onChangeText={(v) => updateForm({ city: v })}
            />
          </View>
          {/* Coordinates */}
          <View className={sectionClass}>
            <View className="mb-1.5 flex-row items-center justify-between">
              <Text className={labelClass}>
                Coordinates <Text className="text-red-500">*</Text>
              </Text>
              <TouchableOpacity
                onPress={handleDetectLocation}
                disabled={detectingLocation}
                className="flex-row items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5"
              >
                {detectingLocation ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                  <Ionicons name="locate-outline" size={13} color="#2563EB" />
                )}
                <Text className="text-xs font-semibold text-blue-600">
                  {detectingLocation ? "Detecting..." : "Detect Location"}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextInput
                  className={inputClass}
                  placeholder="Latitude"
                  placeholderTextColor="#9CA3AF"
                  value={form.latitude}
                  onChangeText={(v) => updateForm({ latitude: v })}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <TextInput
                  className={inputClass}
                  placeholder="Longitude"
                  placeholderTextColor="#9CA3AF"
                  value={form.longitude}
                  onChangeText={(v) => updateForm({ longitude: v })}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Toggles */}
          <View className="mb-5 gap-3">
            <Toggle
              label="Featured Property"
              description="Show this in the Featured section on home"
              value={form.isFeatured}
              onChange={(v) => updateForm({ isFeatured: v })}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting || uploadingImages}
            className="items-center rounded-2xl bg-blue-600 py-4"
            style={{
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
              opacity: submitting || uploadingImages ? 0.7 : 1,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="font-bold text-base text-white">
                {submitLabel}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const Counter = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) => (
  <View className="flex-1">
    <Text className={labelClass}>{label}</Text>
    <View className="flex-row items-center overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <TouchableOpacity
        onPress={() => onChange(Math.max(1, value - 1))}
        className="h-11 w-11 items-center justify-center"
      >
        <Ionicons name="remove" size={18} color="#374151" />
      </TouchableOpacity>
      <Text className="flex-1 text-center font-bold text-base text-gray-800">
        {value}
      </Text>
      <TouchableOpacity
        onPress={() => onChange(value + 1)}
        className="h-11 w-11 items-center justify-center"
      >
        <Ionicons name="add" size={18} color="#374151" />
      </TouchableOpacity>
    </View>
  </View>
);

const Toggle = ({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}) => (
  <TouchableOpacity
    onPress={() => onChange(!value)}
    className={`flex-row items-center justify-between rounded-2xl border p-4 ${
      value ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white"
    }`}
  >
    <View className="mr-3 flex-1">
      <Text
        className={`font-semibold ${value ? "text-blue-700" : "text-gray-700"}`}
      >
        {label}
      </Text>
      {description && (
        <Text className="mt-0.5 text-xs text-gray-400">{description}</Text>
      )}
    </View>
    <View
      className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
        value ? "border-blue-600 bg-blue-600" : "border-gray-300"
      }`}
    >
      {value && <Ionicons name="checkmark" size={14} color="white" />}
    </View>
  </TouchableOpacity>
);
