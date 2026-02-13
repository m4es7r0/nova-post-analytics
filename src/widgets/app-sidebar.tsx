"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconChartBar,
  IconDashboard,
  IconMapPin,
  IconPackage,
  IconSettings,
  IconTruck,
  IconTruckDelivery,
  IconClipboardList,
} from "@tabler/icons-react";

import { NavMain } from "@/widgets/nav-main";
import { NavSecondary } from "@/widgets/nav-secondary";
import { NavUser } from "@/widgets/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Аналітика",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Відправлення",
      url: "/dashboard/shipments",
      icon: IconTruck,
    },
    {
      title: "Трекінг",
      url: "/dashboard/tracking",
      icon: IconChartBar,
    },
    {
      title: "Відділення",
      url: "/dashboard/divisions",
      icon: IconMapPin,
    },
    {
      title: "Виклик кур'єра",
      url: "/dashboard/pickups",
      icon: IconTruckDelivery,
    },
    {
      title: "Реєстри",
      url: "/dashboard/registries",
      icon: IconClipboardList,
    },
  ],
  navSecondary: [
    {
      title: "Налаштування",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
    // {
    //   title: "Допомога",
    //   url: "#",
    //   icon: IconHelp,
    // },
    // {
    //   title: "Пошук",
    //   url: "#",
    //   icon: IconSearch,
    // },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard" prefetch={false}>
                <IconPackage className="!size-5" />
                <span className="text-base font-semibold">
                  Nova Post Analytics
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
