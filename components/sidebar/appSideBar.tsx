"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavMainWithSub } from "./nav-main-with-sub"
import { useAuth } from "@/context/auth"
import { LogoutButton } from "@/components/ui/logOutButton"
import { ImportDialog } from "@/components/dashboard/import-dialog"
import {
  IconLayoutDashboard,
  IconReport,
  IconFileReport,
  IconUsers,
  IconArrowsExchange,
  IconBuildingStore,
  IconCloudNetwork,
  IconSettings,
} from "@tabler/icons-react"

export function AppSideBar() {
  const { auth } = useAuth()
  const isSuperAdmin = auth.role === "superadmin"

  const mainItems = [
    {
      title: "Dashboard",
      icon: IconLayoutDashboard,
      subItems: [
        { title: "Analytics", url: "/dashboard/analytics" },
        { title: "Operations", url: "/dashboard/operations" },
        { title: "Transaction Analytics", url: "/dashboard/transaction-analytics" },
      ],
    },
    { title: "Reports", url: "/reports", icon: IconReport },
    { title: "Report Generator", url: "/report-generator", icon: IconFileReport },
    ...(isSuperAdmin
      ? [{ title: "Users", url: "/users", icon: IconUsers }]
      : []),
  ]

  const placeholderItems = [
    { title: "Transactions", url: "/transactions", icon: IconArrowsExchange },
    { title: "Merchants", url: "/merchants", icon: IconBuildingStore },
    { title: "Providers", url: "/providers", icon: IconCloudNetwork },
    { title: "Settings", url: "#", icon: IconSettings },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <span className="text-lg font-bold">Zippy Pay</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMainWithSub items={mainItems} label="Main" />
        <SidebarSeparator />
        <NavMain items={placeholderItems} label="Other" />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-2 p-2">
          {isSuperAdmin && <ImportDialog />}
          <LogoutButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
