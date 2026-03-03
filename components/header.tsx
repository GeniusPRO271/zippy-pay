"use client"

import { SidebarTrigger } from "./ui/sidebar"
import { ModeToggle } from "./ui/theme-dropdown"
import { Separator } from "./ui/separator"

function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex-1" />
      <ModeToggle />
    </header>
  )
}

export default Header
