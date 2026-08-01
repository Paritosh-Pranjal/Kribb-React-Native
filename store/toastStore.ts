import { create } from "zustand";

export type ToastType = "error" | "success" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastState {
  toast: Toast | null;
  show: (message: string, type?: ToastType) => void;
  hide: () => void;
}

let nextId = 0;

export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  show: (message, type = "info") => set({ toast: { id: nextId++, message, type } }),
  hide: () => set({ toast: null }),
}));
