import { NETWORKS, getNetworkName, getNetworkColor, getNetworkLogo } from "@/lib/network-detector"
import { cn } from "@/lib/utils"

interface NetworkSelectorProps {
  selected: string | null
  onSelect: (network: string) => void
  autoDetected?: boolean
}

export function NetworkSelector({ selected, onSelect, autoDetected }: NetworkSelectorProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Network
        </label>
        {autoDetected && selected && (
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            Auto-detected
          </span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {NETWORKS.map((net) => {
          const isSelected = selected === net
          const color = getNetworkColor(net)
          const logo = getNetworkLogo(net)
          const name = getNetworkName(net)
          return (
            <button
              key={net}
              type="button"
              onClick={() => onSelect(net)}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                isSelected
                  ? "border-current shadow-md scale-105"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 opacity-60 hover:opacity-100"
              )}
              style={isSelected ? { borderColor: color, backgroundColor: `${color}15` } : undefined}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white"
                style={{ backgroundColor: color }}
              >
                {logo}
              </div>
              <span
                className={cn(
                  "text-xs font-semibold",
                  isSelected ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
                )}
              >
                {name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
