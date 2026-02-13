"use client";

import * as React from "react";
import { type Icon } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar";

const prefetchedHrefs = new Set<string>();
const PREFETCH_DELAY_MS = 400;

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timersRef = React.useRef<Record<string, number>>({});

  const getPrefetchHref = React.useCallback(
    (url: string): string | null => {
      if (url !== "/dashboard" && url !== "/dashboard/shipments") return null;

      const params = new URLSearchParams();
      const from = searchParams.get("from");
      const to = searchParams.get("to");
      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const qs = params.toString();
      return qs ? `${url}?${qs}` : url;
    },
    [searchParams]
  );

  const clearIntentTimer = React.useCallback((url: string) => {
    const id = timersRef.current[url];
    if (id) {
      window.clearTimeout(id);
      delete timersRef.current[url];
    }
  }, []);

  const prefetchOnIntent = React.useCallback(
    (url: string) => {
      const href = getPrefetchHref(url);
      if (!href || prefetchedHrefs.has(href)) return;
      clearIntentTimer(url);

      timersRef.current[url] = window.setTimeout(() => {
        prefetchedHrefs.add(href);
        router.prefetch(href);
        delete timersRef.current[url];
      }, PREFETCH_DELAY_MS);
    },
    [router, getPrefetchHref, clearIntentTimer]
  );

  React.useEffect(() => {
    return () => {
      for (const id of Object.values(timersRef.current)) {
        window.clearTimeout(id);
      }
      timersRef.current = {};
    };
  }, []);

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <IconCirclePlusFilled />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu> */}
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link
                  href={item.url}
                  prefetch={false}
                  onMouseEnter={() => prefetchOnIntent(item.url)}
                  onFocus={() => prefetchOnIntent(item.url)}
                  onMouseLeave={() => clearIntentTimer(item.url)}
                  onBlur={() => clearIntentTimer(item.url)}
                  onTouchStart={() => prefetchOnIntent(item.url)}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
