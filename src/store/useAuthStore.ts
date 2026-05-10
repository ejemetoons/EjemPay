import { create } from "zustand"
import type { Tier } from "@/lib/pricing"

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  tier: Tier
  tx_pin: string | null
  created_at: string | null
}

interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: UserProfile | null) => void
  setAuthenticated: (value: boolean) => void
  setLoading: (value: boolean) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user }),
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setLoading: (value) => set({ isLoading: value }),
  clearSession: () => set({ user: null, isAuthenticated: false }),
}))
