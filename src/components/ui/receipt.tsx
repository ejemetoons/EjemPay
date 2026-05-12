"use client"

import { useRef } from "react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface ReceiptProps {
  transaction: {
    id: string
    amount: number
    type: string
    status: string
    created_at: string
    details: Record<string, unknown>
  }
}

export function Receipt({ transaction }: ReceiptProps) {
  const ref = useRef<HTMLDivElement>(null)

  const phone = transaction.details?.phone
  const network = transaction.details?.network

  return (
    <div ref={ref} className="bg-white p-6 rounded-2xl max-w-sm mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl">✓</span>
        </div>
        <h3 className="text-h3 font-h3 text-primary">Transaction Receipt</h3>
      </div>

      <div className="space-y-3">
        <Row label="Status" value={transaction.status.toUpperCase()} />
        <Row label="Type" value={transaction.type} />
        <Row label="Amount" value={formatCurrency(transaction.amount)} />
        <Row label="Date" value={formatDate(transaction.created_at)} />
        {phone ? <Row label="Phone" value={String(phone)} /> : null}
        {network ? <Row label="Network" value={String(network)} /> : null}
        <Row label="Reference" value={transaction.id.slice(0, 8)} />
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-outline-variant/30">
      <span className="text-sm text-on-surface-variant">{label}</span>
      <span className="text-sm font-semibold text-on-surface">{value}</span>
    </div>
  )
}
