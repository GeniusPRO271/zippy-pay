"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible"
import { IconChevronRight, TablerIcon } from "@tabler/icons-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

interface SubItem {
  title: string
  url: string
}

interface CollapsibleMenuItem {
  title: string
  icon: TablerIcon
  subItems: SubItem[]
}

interface FlatMenuItem {
  title: string
  url: string
  icon: TablerIcon
}

type NavItem = CollapsibleMenuItem | FlatMenuItem

function isCollapsible(item: NavItem): item is CollapsibleMenuItem {
  return "subItems" in item
}

export function NavMainWithSub({
  items,
  label = "Application",
}: {
  items: NavItem[]
  label?: string
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            if (isCollapsible(item)) {
              const isAnySubActive = item.subItems.some(
                (sub) =>
                  pathname === sub.url ||
                  pathname.startsWith(sub.url + "/")
              )

              return (
                <Collapsible
                  key={item.title}
                  defaultOpen={isAnySubActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isAnySubActive}
                        tooltip={item.title}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                        <IconChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" size={16} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.subItems.map((sub) => {
                          const isSubActive =
                            pathname === sub.url ||
                            pathname.startsWith(sub.url + "/")

                          return (
                            <SidebarMenuSubItem key={sub.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isSubActive}
                              >
                                <Link href={sub.url}>
                                  <span>{sub.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )
            }

            const flatItem = item as FlatMenuItem
            const isActive =
              flatItem.url === "#"
                ? false
                : flatItem.url === "/"
                  ? pathname === "/"
                  : pathname === flatItem.url ||
                    pathname.startsWith(flatItem.url + "/")

            return (
              <SidebarMenuItem key={flatItem.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={flatItem.title}
                >
                  <Link href={flatItem.url}>
                    <flatItem.icon />
                    <span>{flatItem.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
