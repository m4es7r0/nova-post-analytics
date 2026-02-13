import { Suspense } from "react";
import { SiteHeader } from "@/widgets/site-header";
import { DateRangeFilter } from "@/widgets/date-range-filter";
import { ShipmentsView } from "@/widgets/shipments-view";
import { getShipments } from "@/entities/shipment";
import type { Shipment } from "@/entities/shipment/model/types";
import { requireApiKey } from "@/shared/lib/get-api-key";
import { format, startOfWeek, endOfWeek } from "date-fns";

/** Clamp a date to never exceed today */
function clampToToday(d: Date): Date {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return d > today ? today : d;
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ShipmentsPage({ searchParams }: PageProps) {
  const apiKey = await requireApiKey();
  const params = await searchParams;

  // --- Date range ---
  const now = new Date();
  const defaultFrom = format(
    startOfWeek(now, { weekStartsOn: 1 }),
    "yyyy-MM-dd",
  );
  const defaultTo = format(
    clampToToday(endOfWeek(now, { weekStartsOn: 1 })),
    "yyyy-MM-dd",
  );

  const dateFrom = typeof params.from === "string" ? params.from : defaultFrom;
  let dateTo = typeof params.to === "string" ? params.to : defaultTo;

  // Clamp dateTo to today
  const todayStr = format(now, "yyyy-MM-dd");
  if (dateTo > todayStr) dateTo = todayStr;

  // --- Pagination ---
  const page = Math.max(1, Number(params.page) || 1);
  const perPage = [25, 50, 100].includes(Number(params.perPage))
    ? Number(params.perPage)
    : 50;

  // --- Fetch ALL shipments (up to maxPages to avoid excessive calls) ---
  const maxPages = 20;
  const fetchConcurrency = 4;
  const fetchPerPage = 100;
  const allShipments: Shipment[] = [];
  let totalAvailable = 0;

  // Fetch first page, then load remaining pages concurrently in chunks.
  const firstPage = await getShipments({ page: 1, limit: fetchPerPage }, apiKey);
  if (firstPage.success) {
    allShipments.push(...firstPage.data.items);
    totalAvailable = firstPage.data.total;

    const lastApiPage = Math.min(firstPage.data.last_page, maxPages);
    const remainingPages = Array.from(
      { length: Math.max(lastApiPage - 1, 0) },
      (_, i) => i + 2,
    );

    for (let i = 0; i < remainingPages.length; i += fetchConcurrency) {
      const chunk = remainingPages.slice(i, i + fetchConcurrency);
      const results = await Promise.all(
        chunk.map((pageNum) =>
          getShipments({ page: pageNum, limit: fetchPerPage }, apiKey),
        ),
      );
      for (const result of results) {
        if (result.success) {
          allShipments.push(...result.data.items);
        }
      }
    }
  }

  // --- Filter by date range ---
  const filtered = allShipments.filter((s) => {
    const dateKey = s.createdAt ? s.createdAt.substring(0, 10) : null;
    if (!dateKey) return true;
    if (dateFrom && dateKey < dateFrom) return false;
    if (dateTo && dateKey > dateTo) return false;
    return true;
  });

  // --- Paginate filtered results ---
  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, lastPage);
  const startIdx = (safePage - 1) * perPage;
  const pageItems = filtered.slice(startIdx, startIdx + perPage);

  return (
    <>
      <SiteHeader title="Відправлення">
        <Suspense fallback={null}>
          <DateRangeFilter />
        </Suspense>
      </SiteHeader>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <ShipmentsView
              shipments={pageItems}
              total={total}
              totalAvailable={totalAvailable}
              loadedTotal={allShipments.length}
              page={safePage}
              lastPage={lastPage}
              perPage={perPage}
              dateFrom={dateFrom}
              dateTo={dateTo}
            />
          </div>
        </div>
      </div>
    </>
  );
}
