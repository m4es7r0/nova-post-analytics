import { Separator } from "@/shared/ui/separator";
import { SidebarTrigger } from "@/shared/ui/sidebar";

export function SiteHeader({
  title = "Dashboard",
  children,
}: {
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex shrink-0 flex-col justify-center gap-0 border-b transition-[width,height] ease-linear min-h-(--header-height) group-has-data-[collapsible=icon]/sidebar-wrapper:min-h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 min-h-(--header-height)">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium whitespace-nowrap">{title}</h1>
        {children && (
          <div className="ml-auto flex items-center overflow-x-auto">
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
