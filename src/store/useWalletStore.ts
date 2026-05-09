import { create } from "zustand"

interface WalletState {
  balance: number
  isLoading: boolean
  lastUpdated: Date | null
  setBalance: (balance: number) => void
  setLoading: (value: boolean) => void
  updateTimestamp: () => void
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  isLoading: true,
  lastUpdated: null,
  setBalance: (balance) => set({ balance }),
  setLoading: (value) => set({ isLoading: value }),
  updateTimestamp: () => set({ lastUpdated: new Date() }),
}))
