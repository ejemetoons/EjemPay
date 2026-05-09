import { create } from "zustand"

interface Toast {
  id: string
  type: "success" | "error" | "info"
  message: string
}

interface UiState {
  toasts: Toast[]
  pinModalOpen: boolean
  pinCallback: ((pin: string) => void) | null
  addToast: (type: Toast["type"], message: string) => void
  removeToast: (id: string) => void
  openPinModal: (callback: (pin: string) => void) => void
  closePinModal: () => void
}

let toastId = 0

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  pinModalOpen: false,
  pinCallback: null,
  addToast: (type, message) => {
    const id = String(++toastId)
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  openPinModal: (callback) => set({ pinModalOpen: true, pinCallback: callback }),
  closePinModal: () => set({ pinModalOpen: false, pinCallback: null }),
}))
