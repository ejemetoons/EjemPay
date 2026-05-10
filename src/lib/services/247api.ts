const API_BASE = process.env.API_247_BASE_URL || "https://www.247api.com.ng/api"
const API_KEY = process.env.API_247_KEY || ""

const headers = {
  Authorization: `Token ${API_KEY}`,
  "Content-Type": "application/json",
}

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "API request failed" }))
    throw new Error(error.message || `API Error: ${res.status}`)
  }

  return res.json() as Promise<T>
}

export interface UserDetails {
  status: string
  wallet: number
  user: {
    name: string
    wallet: string
  }
}

export interface Network {
  id: number
  network: string
  prefix: string
}

export interface DataPlan {
  plan_id: number
  day: string
  type: string
  network: string
  datasize: string
  price: number
}

export interface CablePlan {
  id: string
  name: string
  cable: string
  price: string
  cable_id: string
}

export interface DisCo {
  id: string
  name: string
  abb: string
  apidiscount: string
}

export interface ExamPlan {
  id: string
  name: string
  price: string
}

export interface PurchaseResponse {
  status: string
  message: string
  response?: string
  "request-id"?: string
  amount?: number | string
  network?: string
  airtime_type?: string
  data_size?: string
  data_type?: string
  cable_plan?: string
  iuc?: string
  disco_name?: string
  meter_type?: string
  meter_number?: string
  token?: string | null
  pin?: string
  exam?: string
  old_wallet?: number
  new_wallet?: number
}

export interface ValidationResult {
  status: string
  name: string
  message: string
  outstandingAmount?: number
  customer_address?: string
}

export async function getUserDetails(): Promise<UserDetails> {
  return apiRequest<UserDetails>("/user")
}

export async function getNetworks(): Promise<Network[]> {
  return apiRequest<Network[]>("/get-networks?service=airtime")
}

export async function purchaseAirtime(params: {
  network: number
  phone: string
  amount: string
  plan_type?: string
  bypass?: boolean
  "request-id"?: string
}): Promise<PurchaseResponse> {
  return apiRequest<PurchaseResponse>("/airtime", {
    method: "POST",
    body: JSON.stringify(params),
  })
}

export async function getDataPlans(): Promise<DataPlan[]> {
  return apiRequest<DataPlan[]>("/data_plans")
}

export async function purchaseData(params: {
  network: number
  phone: string
  data_plan: number
  bypass?: boolean
  "request-id"?: string
}): Promise<PurchaseResponse> {
  return apiRequest<PurchaseResponse>("/data", {
    method: "POST",
    body: JSON.stringify(params),
  })
}

export async function getCablePlans(cable: string): Promise<CablePlan[]> {
  return apiRequest<CablePlan[]>(`/get-cable-plan?cable=${cable}`)
}

export async function validateCable(iuc: string, cable: string): Promise<ValidationResult> {
  return apiRequest<ValidationResult>(
    `/cable/cable-validation?iuc=${encodeURIComponent(iuc)}&cable=${cable}`
  )
}

export async function purchaseCable(params: {
  cable: number
  iuc: string
  cable_plan: number
  bypass?: boolean
  "request-id"?: string
}): Promise<PurchaseResponse> {
  return apiRequest<PurchaseResponse>("/cable", {
    method: "POST",
    body: JSON.stringify(params),
  })
}

export async function getDisCos(): Promise<DisCo[]> {
  return apiRequest<DisCo[]>("/get-bill")
}

export async function validateMeter(params: {
  meter_number: string
  meter_type: string
  disco: number
}): Promise<ValidationResult> {
  const qs = new URLSearchParams({
    meter_number: params.meter_number,
    meter_type: params.meter_type,
    disco: String(params.disco),
  }).toString()
  return apiRequest<ValidationResult>(`/bill/bill-validation?${qs}`)
}

export async function purchaseElectricity(params: {
  disco: number
  meter_type: string
  meter_number: string
  amount: string
  phone?: string
  bypass?: boolean
  "request-id"?: string
}): Promise<PurchaseResponse> {
  return apiRequest<PurchaseResponse>("/bill", {
    method: "POST",
    body: JSON.stringify(params),
  })
}

export async function getExamPlans(): Promise<ExamPlan[]> {
  return apiRequest<ExamPlan[]>("/get-exam")
}

export async function purchaseExam(params: {
  exam: number
  quantity: number
}): Promise<PurchaseResponse> {
  return apiRequest<PurchaseResponse>("/exam", {
    method: "POST",
    body: JSON.stringify(params),
  })
}
