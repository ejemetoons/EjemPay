export type Tier = "standard" | "reseller"
export type ServiceType = "airtime" | "data" | "cable" | "electricity" | "exam_pin"

export function calculateServicePrice(
  apiCost: number,
  serviceType: ServiceType,
  tier: Tier
): number {
  if (tier === "reseller") {
    if (serviceType === "data") {
      return apiCost + 7
    }
    return Math.ceil(apiCost * 1.01)
  }

  if (serviceType === "data") {
    return apiCost + 20
  }
  return Math.ceil(apiCost * 1.03)
}

export function calculateTopUpFee(amount: number): number {
  const squadFee = amount * 0.015
  const minProfit = 20
  const calculatedFee = squadFee + minProfit
  return Math.max(50, Math.ceil(calculatedFee))
}

export function getAmountToReceive(amount: number): number {
  const fee = calculateTopUpFee(amount)
  return amount - fee
}

export function getUpgradeFee(): number {
  return 6500
}

export function formatPrice(price: number): string {
  return `₦${price.toLocaleString("en-NG")}`
}
