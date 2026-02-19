"use client"

import React, { useEffect, useRef } from "react"
import { Toaster } from "sonner"

import AppSidebar from "@/components/layout/AppSidebar"
import Header from "@/components/layout/Header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TOAST_DURATION_MS } from "@/constants/ui"
import { authClient } from "@/lib/auth/client"
import { useAuthStore } from "@/lib/stores"

export default function RootWrapper({ children }: { children: React.ReactNode }) {
  const setUserInfo = useAuthStore((state) => state.setUserInfo)
  const sessionSynced = useRef(false)

  useEffect(() => {
    if (sessionSynced.current) {
      return
    }
    sessionSynced.current = true

    const syncSession = async () => {
      try {
        const { data } = await authClient.getSession()
        if (data?.user?.email) {
          await setUserInfo(data.user.email)
        }
      } catch (error) {
        console.error("Failed to sync session:", error)
      }
    }
    syncSession().catch(console.error)
  }, [setUserInfo])

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header />
          {children}
        </SidebarInset>
      </SidebarProvider>
      <Toaster
        position="bottom-right"
        expand={false}
        toastOptions={{
          duration: TOAST_DURATION_MS
        }}
        visibleToasts={1}
        closeButton
      />
    </>
  )
}
