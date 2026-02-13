import { redirect } from "next/navigation";
import { getSession } from "@/shared/lib/auth-guard";
import { getApiKey } from "@/shared/lib/get-api-key";
import { AppSidebar } from "@/widgets/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar";
import { ApiKeySetup } from "@/features/settings/ui/api-key-setup";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Check if user has configured their API key
  const apiKey = await getApiKey();

  if (!apiKey) {
    // Show full-screen setup — user cannot access dashboard without a key
    return <ApiKeySetup />;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
