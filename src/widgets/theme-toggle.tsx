"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { IconSun, IconMoon, IconDeviceDesktop } from "@tabler/icons-react"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/shared/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton tooltip="Тема">
              {theme === "dark" ? (
                <IconMoon className="size-4" />
              ) : theme === "light" ? (
                <IconSun className="size-4" />
              ) : (
                <IconDeviceDesktop className="size-4" />
              )}
              <span>Тема</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <IconSun className="mr-2 size-4" />
              Світла
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <IconMoon className="mr-2 size-4" />
              Темна
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <IconDeviceDesktop className="mr-2 size-4" />
              Системна
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
