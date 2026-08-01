import React from "react";
import { useRouter } from "expo-router";
import { useSupabase } from "@/hooks/useSupabase";
import PropertyForm, { PropertyFormValues } from "@/components/PropertyForm";

export default function Create() {
  const router = useRouter();
  const authSupabase = useSupabase();

  const handleSubmit = async (values: PropertyFormValues) => {
    return authSupabase.from("properties").insert({
      ...values,
      is_sold: false,
    });
  };

  return (
    <PropertyForm
      headerTitle="Add Property"
      submitLabel="List Property"
      successMessage="Property listed successfully."
      onSubmit={handleSubmit}
      onSuccess={() => router.replace("/(root)/(tabs)")}
    />
  );
}
