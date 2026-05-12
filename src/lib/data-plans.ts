export interface DataPlan {
  plan_id: number
  day: string
  type: string
  network: string
  datasize: string
  price: number
}

export type PlanTabId = "hot" | "daily" | "weekly" | "monthly" | "3months" | "social" | "others"

export const DATA_TABS: { id: PlanTabId; label: string }[] = [
  { id: "hot", label: "Hot" },
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "3months", label: "3 Months" },
  { id: "social", label: "Social" },
  { id: "others", label: "Others" },
]

function parseDataSizeGB(size: string): number {
  const match = size.trim().match(/^([\d.]+)\s*(MB|GB)$/i)
  if (!match) return 0
  const value = parseFloat(match[1])
  return match[2].toUpperCase() === "MB" ? value / 1024 : value
}

export function classifyPlan(plan: DataPlan): PlanTabId {
  const type = plan.type.toLowerCase()

  if (type.includes("social") || type.includes("whatsapp") || type.includes("instagram") || type.includes("video")) {
    return "social"
  }

  const days = parseInt(plan.day)
  if (isNaN(days)) return "others"
  if (days <= 2) return "daily"
  if (days <= 14) return "weekly"
  if (days <= 31) return "monthly"
  if (days >= 60) return "3months"

  return "others"
}

export function getPricePerGB(plan: DataPlan): number {
  const gb = parseDataSizeGB(plan.datasize)
  return gb > 0 ? plan.price / gb : Infinity
}

export function formatPricePerGB(plan: DataPlan): string {
  const ppgb = getPricePerGB(plan)
  if (ppgb === Infinity) return ""
  return `₦${Math.round(ppgb).toLocaleString("en-NG")}/GB`
}

export function getSortedPlans(plans: DataPlan[]): DataPlan[] {
  return [...plans].sort((a, b) => getPricePerGB(a) - getPricePerGB(b))
}

export function getPlansForTab(plans: DataPlan[], tab: PlanTabId): DataPlan[] {
  if (tab === "hot") {
    return getSortedPlans(plans)
  }
  return plans.filter((p) => classifyPlan(p) === tab)
}
