import { useEffect, useState } from "react";

interface DebouncedValue<T> {
  value: T;
  isDebouncing: boolean;
}

export function useDebounce<T>(value: T, delay: number): DebouncedValue<T> {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    setIsDebouncing(true);
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return { value: debouncedValue, isDebouncing };
}
