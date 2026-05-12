import { getNetworkName, getNetworkColor, getNetworkLogo, detectNetwork } from "@/lib/network-detector"
import { cn } from "@/lib/utils"
import Image from "next/image"

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
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn("rounded-full flex items-center justify-center p-1", sizes[size])}
        style={{ backgroundColor: color }}
      >
        {logo ? (
          <Image src={logo} alt={name} width={parseInt(sizes[size].match(/\d+/)?.[0] || "40") - 8} height={parseInt(sizes[size].match(/\d+/)?.[0] || "40") - 8} className="object-contain" />
        ) : (
          <span className="text-sm font-bold text-white">{name[0]}</span>
        )}
      </div>
      <span className="font-medium text-on-surface">{name}</span>
    </div>
  )
}

export function NetworkBadge({ network }: { network: string | null }) {
  if (!network) return null

  const name = getNetworkName(network)
  const color = getNetworkColor(network)
  const logo = getNetworkLogo(network)

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {logo ? (
        <Image src={logo} alt={name} width={16} height={16} className="rounded-sm" />
      ) : (
        <span className="w-2 h-2 rounded-full bg-white/50" />
      )}
      {name}
    </span>
  )
}
