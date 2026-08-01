import { useAuth } from "@clerk/expo";
import { useEffect, useState } from "react";
import { useSupabase } from "./useSupabase";

export function useSavedProperty(propertyId: string, onUnsave?: () => void) {
  const { userId } = useAuth();
  const authSupabase = useSupabase();
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(true);

  const constIfSaved = async () => {
    if (!userId) {
      setIsSaved(false);
      setSaveLoading(false);
      return;
    }

    try {
      setSaveLoading(true);
      const { data, error } = await authSupabase
        .from("saved_properties")
        .select("*")
        .eq("user_clerk_id", userId)
        .eq("property_id", propertyId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching saved status:", error);
        setIsSaved(false);
      } else {
        setIsSaved(!!data);
      }
    } catch (error) {
      console.error("Error fetching saved status:", error);
      setIsSaved(false);
    } finally {
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId && userId) {
      constIfSaved();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, userId]);

  const toggleSave = async () => {
    if (!userId || saveLoading) {
      return;
    }

    try {
      setSaveLoading(true);
      if (isSaved) {
        // Unsave the property
        const { error } = await authSupabase
          .from("saved_properties")
          .delete()
          .eq("user_clerk_id", userId)
          .eq("property_id", propertyId);

        if (error) {
          console.error("Error unsaving property:", error);
        } else {
          setIsSaved(false);
          if (onUnsave) onUnsave();
        }
      } else {
        // Save the property
        const { error } = await authSupabase.from("saved_properties").insert({
          user_clerk_id: userId,
          property_id: propertyId,
        });

        if (error) {
          console.error("Error saving property:", error);
        } else {
          setIsSaved(true);
        }
      }
    } catch (error) {
      console.error("Error toggling saved status:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  return { isSaved, saveLoading, toggleSave };
}
