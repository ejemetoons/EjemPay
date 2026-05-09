const networkPrefixes: Record<string, string> = {
  "0702": "mtn",
  "0703": "mtn",
  "0704": "mtn",
  "0705": "mtn",
  "0706": "mtn",
  "0803": "mtn",
  "0806": "mtn",
  "0810": "mtn",
  "0813": "mtn",
  "0814": "mtn",
  "0816": "mtn",
  "0817": "mtn",
  "0903": "mtn",
  "0906": "mtn",
  "0913": "mtn",
  "0916": "mtn",
  "0701": "airtel",
  "0708": "airtel",
  "0802": "airtel",
  "0808": "airtel",
  "0812": "airtel",
  "0901": "airtel",
  "0902": "airtel",
  "0904": "airtel",
  "0907": "airtel",
  "0912": "airtel",
  "0805": "glo",
  "0807": "glo",
  "0811": "glo",
  "0815": "glo",
  "0905": "glo",
  "0915": "glo",
  "0709": "9mobile",
  "0809": "9mobile",
  "0818": "9mobile",
  "0908": "9mobile",
  "0909": "9mobile",
}

const networkNames: Record<string, string> = {
  mtn: "MTN",
  airtel: "Airtel",
  glo: "Glo",
  "9mobile": "9mobile",
}

const networkColors: Record<string, string> = {
  mtn: "#FFCC00",
  airtel: "#ED1C24",
  glo: "#55B848",
  "9mobile": "#006837",
}

const networkLogos: Record<string, string> = {
  mtn: "M",
  airtel: "A",
  glo: "G",
  "9mobile": "9",
}

export function detectNetwork(phone: string): string | null {
  const cleaned = phone.replace(/\s/g, "")
  const prefix = cleaned.length >= 4 ? cleaned.slice(0, 4) : null
  if (!prefix) return null
  return networkPrefixes[prefix] || null
}

export function getNetworkName(network: string | null): string {
  if (!network) return "Unknown"
  return networkNames[network] || "Unknown"
}

export function getNetworkColor(network: string | null): string {
  if (!network) return "#999"
  return networkColors[network] || "#999"
}

export function getNetworkLogo(network: string | null): string {
  if (!network) return "?"
  return networkLogos[network] || "?"
}
