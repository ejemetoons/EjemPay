import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastContainer } from "@/components/ui/toast"
import { PinModal } from "@/components/ui/pin-modal"

export const metadata: Metadata = {
  title: "Ejempay - Instant Airtime, Data & Bills Payment",
  description: "Nigeria's smartest VTU platform. Buy airtime, data bundles, pay cable TV and electricity bills instantly at the best prices.",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-on-surface min-h-screen smooth-fade">
        <ThemeProvider>
          {children}
          <ToastContainer />
          <PinModal />
        </ThemeProvider>
      </body>
    </html>
  )
}
