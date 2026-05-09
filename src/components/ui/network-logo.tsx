import { getNetworkName, getNetworkColor, getNetworkLogo, detectNetwork } from "@/lib/network-detector"
import { cn } from "@/lib/utils"

interface NetworkLogoProps {
  phone: string
  size?: "sm" | "md" | "lg"
}

export function NetworkLogo({ phone, size = "md" }: NetworkLogoProps) {
  const network = detectNetwork(phone)
  const name = getNetworkName(network)
  const color = getNetworkColor(network)
  const logo = getNetworkLogo(network)

  if (!network) return null

  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn("rounded-full flex items-center justify-center font-bold text-white", sizes[size])}
        style={{ backgroundColor: color }}
      >
        {logo}
      </div>
      <span className="font-medium text-gray-900">{name}</span>
    </div>
  )
}

export function NetworkBadge({ network }: { network: string | null }) {
  if (!network) return null

  const name = getNetworkName(network)
  const color = getNetworkColor(network)

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-white"
      style={{ backgroundColor: color }}
    >
      <span className="w-2 h-2 rounded-full bg-white/50" />
      {name}
    </span>
  )
}
