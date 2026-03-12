"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSideBar } from "@/components/sidebar/appSideBar"
import Header from "@/components/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSideBar />
      <SidebarInset>
        <Header />
        <div className="p-5 w-full h-full">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
