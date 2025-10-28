
import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { IconBuildingStore, IconCloudNetwork, IconLayoutDashboard } from "@tabler/icons-react"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconLayoutDashboard,
  },
  {
    title: "Merchants",
    url: "/merchant",
    icon: IconBuildingStore,
  },
  {
    title: "Providers",
    url: "#",
    icon: IconCloudNetwork,
  },
]

export function AppSideBar() {
  return (
    <Sidebar>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
    </Sidebar>
  )
}
