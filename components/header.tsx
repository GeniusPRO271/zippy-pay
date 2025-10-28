import { SidebarTrigger } from "./ui/sidebar"
import { ModeToggle } from "./ui/theme-dropdown"

function Header() {
  return (
    <div className="px-5 pt-5 flex w-full justify-between">
      <SidebarTrigger />
      <ModeToggle />
    </div>
  )
}

export default Header
