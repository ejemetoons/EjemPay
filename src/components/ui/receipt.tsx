"use client"

import { useRef, useState } from "react"
import html2canvas from "html2canvas"
import { Card } from "./card"
import { Button } from "./button"
import { Download, Share2 } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface ReceiptProps {
  type: string
  amount: number
  status: string
  details: Record<string, string>
  reference: string
  date: Date
}

export function Receipt({ type, amount, status, details, reference, date }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement | null>(null)
  const [downloading, setDownloading] = useState(false)

  const downloadReceipt = async () => {
    if (!receiptRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      })
      const link = document.createElement("a")
      link.download = `ejempay-receipt-${reference}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch {
      console.error("Failed to download receipt")
    }
    setDownloading(false)
  }

  const shareReceipt = async () => {
    if (!receiptRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      })
      if (navigator.share) {
        canvas.toBlob(async (blob) => {
          if (!blob) return
          const file = new File([blob], `ejempay-receipt-${reference}.png`, { type: "image/png" })
          try {
            await navigator.share({
              title: "Ejempay Receipt",
              text: `Transaction receipt for ${formatCurrency(amount)}`,
              files: [file],
            })
          } catch {
            const link = document.createElement("a")
            link.download = `ejempay-receipt-${reference}.png`
            link.href = canvas.toDataURL("image/png")
            link.click()
          }
        }, "image/png")
      } else {
        const link = document.createElement("a")
        link.download = `ejempay-receipt-${reference}.png`
        link.href = canvas.toDataURL("image/png")
        link.click()
      }
    } catch {
      console.error("Failed to share receipt")
    }
    setDownloading(false)
  }

  return (
    <div className="space-y-4">
      <Card ref={receiptRef} className="max-w-md mx-auto">
        <div className="text-center mb-6 pb-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-blue-600">Ejempay</h2>
          <p className="text-sm text-gray-500 mt-1">Transaction Receipt</p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Type</span>
            <span className="font-medium capitalize">{type.replace("_", " ")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount</span>
            <span className="font-bold text-lg">{formatCurrency(amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                status === "success"
                  ? "bg-green-100 text-green-700"
                  : status === "failed"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Reference</span>
            <span className="font-mono text-sm">{reference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date</span>
            <span className="text-sm">{formatDate(date)}</span>
          </div>

          {Object.entries(details).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-500 capitalize">{key.replace("_", " ")}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">Thank you for using Ejempay</p>
        </div>
      </Card>

      <div className="flex gap-3 justify-center">
        <Button onClick={downloadReceipt} isLoading={downloading} variant="secondary">
          <Download className="w-4 h-4" />
          Download
        </Button>
        <Button onClick={shareReceipt} isLoading={downloading} variant="primary">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>
    </div>
  )
}
