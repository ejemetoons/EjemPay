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
        <h3 className="text-h3 font-h3 text-on-surface">Select Network</h3>
        {autoDetected && selected && (
          <span className="text-[10px] font-bold text-secondary uppercase bg-secondary-container/10 px-2 py-0.5 rounded-full">
            Auto
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
                "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all",
                isSelected
                  ? "border-primary bg-surface-container shadow-sm"
                  : "border-outline-variant bg-white hover:border-primary"
              )}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm text-white shadow-sm"
                style={{ backgroundColor: color }}
              >
                {logo}
              </div>
              <span className={cn(
                "text-[10px] uppercase font-bold tracking-wide",
                isSelected ? "text-primary" : "text-on-surface-variant"
              )}>
                {name}
              </span>
              {isSelected && autoDetected && (
                <span className="text-[8px] font-bold text-secondary uppercase -mt-1">auto</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
