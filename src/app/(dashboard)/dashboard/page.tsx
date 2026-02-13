import { Suspense } from "react";
import { SiteHeader } from "@/widgets/site-header";
import { SectionCards } from "@/widgets/section-cards";
import { ChartAreaInteractive } from "@/widgets/chart-area-interactive";
import { ChartDailyCost } from "@/widgets/chart-daily-cost";
import { StatusBreakdown } from "@/widgets/status-breakdown";
import { ShipmentsOverviewTable } from "@/widgets/shipments-overview-table";
import { DateRangeFilter } from "@/widgets/date-range-filter";
import { computeShipmentAnalytics } from "@/entities/shipment/lib/analytics";
import { requireApiKey } from "@/shared/lib/get-api-key";

/** Server-side default: current week Mon–today (never into the future) */
function getDefaultWeek() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon...
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  // Clamp to today — never allow future dates
  const to = sun > now ? now : sun;
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { from: fmt(mon), to: fmt(to) };
}

interface DashboardPageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const defaultWeek = getDefaultWeek();
  const dateFrom = params.from || defaultWeek.from;
  // Clamp dateTo to today — never query future dates
  const todayStr = new Date().toISOString().slice(0, 10);
  const rawTo = params.to || defaultWeek.to;
  const dateTo = rawTo > todayStr ? todayStr : rawTo;

  const apiKey = await requireApiKey();
  const analytics = await computeShipmentAnalytics({
    dateFrom,
    dateTo,
    apiKey,
  });

  return (
    <>
      <SiteHeader title="Аналітика">
        <Suspense fallback={null}>
          <DateRangeFilter />
        </Suspense>
      </SiteHeader>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards
              totalShipments={analytics.totalShipments}
              deliveredCount={analytics.deliveredCount}
              atBranchCount={analytics.atBranchCount}
              inTransitCount={analytics.inTransitCount}
              readyToShipCount={analytics.readyToShipCount}
              returnedCount={analytics.returnedCount}
              returnedPercentage={analytics.returnedPercentage}
              totalDeclaredValue={analytics.totalDeclaredValue}
              deliveredDeclaredValue={analytics.deliveredDeclaredValue}
              totalDeliveryCost={analytics.totalDeliveryCost}
              deliveredDeliveryCost={analytics.deliveredDeliveryCost}
              currencyCode={analytics.currencyCode}
            />
            <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-3 lg:px-6">
              <div className="lg:col-span-2">
                <ChartAreaInteractive
                  data={analytics.dailyStats}
                  currencyCode={analytics.currencyCode}
                />
              </div>
              <div>
                <StatusBreakdown
                  data={analytics.statusBreakdown}
                  total={analytics.totalShipments}
                />
              </div>
            </div>
            <div className="px-4 lg:px-6">
              <ChartDailyCost
                data={analytics.dailyStats}
                currencyCode={analytics.currencyCode}
              />
            </div>
            <ShipmentsOverviewTable shipments={analytics.recentShipments} />
          </div>
        </div>
      </div>
    </>
  );
}
