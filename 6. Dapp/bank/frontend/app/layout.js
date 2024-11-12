import Layout from "@/components/Layout";
import MyRainbowKitProvider from "./MyRainbowKitProvider";
import "./globals.css"
import { Inter as FontSans } from "next/font/google"

import { Toaster } from "@/components/ui/toaster"
 
import { cn } from "@/lib/utils"
 
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "Bank DApp",
  description: "Description...",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background dark font-sans antialiased",
          fontSans.variable
        )}
      >
        <MyRainbowKitProvider>
          <Layout>
            {children}
          </Layout>
        </MyRainbowKitProvider>
        <Toaster />
      </body>
  </html>
  );
}
