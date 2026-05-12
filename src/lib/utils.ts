export function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatCurrencyShort(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }
  return phone
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "")
  return cleaned.length === 11 && cleaned.startsWith("0")
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidTxPin(pin: string): boolean {
  return /^\d{4}$/.test(pin)
}

export function generateRequestId(prefix: string = "EJP"): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}_${timestamp}_${random}`
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return `${str.slice(0, length)}...`
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "success":
      return "text-green-600 bg-green-50"
    case "failed":
      return "text-red-600 bg-red-50"
    case "pending":
      return "text-yellow-600 bg-yellow-50"
    default:
      return "text-gray-600 bg-gray-50"
  }
}

export function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    airtime: "Airtime",
    data: "Data Bundle",
    cable: "Cable TV",
    electricity: "Electricity",
    fund_wallet: "Wallet Funding",
    withdrawal: "Withdrawal",
    upgrade: "Reseller Upgrade",
    exam_pin: "Exam PIN",
  }
  return labels[type] || type
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ")
}
