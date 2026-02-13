import "server-only";

import type { Shipment, ShipmentStatus } from "../model/types";
import { getShipments } from "../api/shipment.api";
import { getDeliveryCost, getDeclaredValue } from "./cost-utils";

// ============================================================
// Shipment Analytics Aggregation (server-only)
// Computes all metrics from shipment data
// ============================================================

/** Status labels (UA + EN) — covers all known Nova Post statuses */
export const STATUS_LABELS: Record<string, { ua: string; en: string }> = {
  // Core statuses
  ReadyToShip: { ua: "Очікує відправки", en: "Ready to Ship" },
  Received: { ua: "Отримано у відділенні", en: "Received at Branch" },
  InTransit: { ua: "В дорозі", en: "In Transit" },
  Delivered: { ua: "Доставлено", en: "Delivered" },
  Returned: { ua: "Повернення", en: "Returned" },
  Deleted: { ua: "Видалено", en: "Deleted" },
  // Additional statuses from API
  Accepted: { ua: "Прийнято", en: "Accepted" },
  Issued: { ua: "Оформлено", en: "Issued" },
  Processing: { ua: "В обробці", en: "Processing" },
  Created: { ua: "Створено", en: "Created" },
  Pending: { ua: "Очікування", en: "Pending" },
  Cancelled: { ua: "Скасовано", en: "Cancelled" },
  OnTheWay: { ua: "В дорозі", en: "On the Way" },
  LoadingCourier: { ua: "Завантаження кур'єром", en: "Loading by Courier" },
  ArrivedAtDestination: { ua: "Прибув у пункт призначення", en: "Arrived at Destination" },
  ArrivedAtSortingCenter: { ua: "Прибув на сортувальний центр", en: "Arrived at Sorting Center" },
  Sorting: { ua: "Сортування", en: "Sorting" },
  AwaitingPickup: { ua: "Очікує отримання", en: "Awaiting Pickup" },
  ReturnInTransit: { ua: "Повернення в дорозі", en: "Return In Transit" },
  Customs: { ua: "На митниці", en: "Customs" },
};

/** Per-day aggregation */
export interface DailyStats {
  date: string; // YYYY-MM-DD
  shipments: number;
  delivered: number;
  returned: number;
  /** Total declared value of goods (оголошена вартість) */
  totalDeclaredValue: number;
  /** Declared value of delivered goods */
  deliveredDeclaredValue: number;
  /** Pure delivery/shipping cost (without COD) */
  totalDeliveryCost: number;
  /** Delivery cost of delivered shipments */
  deliveredDeliveryCost: number;
}

/** Status breakdown */
export interface StatusBreakdown {
  status: string;
  label: string;
  count: number;
  percentage: number;
}

/** Full analytics result */
export interface ShipmentAnalytics {
  /** Total number of shipments */
  totalShipments: number;
  /** Total shipments available in API (may be more than loaded) */
  totalAvailable: number;
  /** Number of loaded shipments */
  loadedShipments: number;
  /** Shipments that were delivered / received by customer */
  deliveredCount: number;
  /** Shipments currently at branch (received at division) */
  atBranchCount: number;
  /** Shipments currently in transit */
  inTransitCount: number;
  /** Ready to ship (created, awaiting pickup) */
  readyToShipCount: number;
  /** Returned / refused shipments */
  returnedCount: number;
  /** Refusal percentage */
  returnedPercentage: number;
  /** Total declared value of all shipments (оголошена вартість) */
  totalDeclaredValue: number;
  /** Declared value of delivered shipments */
  deliveredDeclaredValue: number;
  /** Pure delivery/shipping cost (without COD amount) */
  totalDeliveryCost: number;
  /** Delivery cost of delivered shipments */
  deliveredDeliveryCost: number;
  /** Currency code */
  currencyCode: string;
  /** Earliest shipment date (YYYY-MM-DD) */
  dateFrom: string | null;
  /** Latest shipment date (YYYY-MM-DD) */
  dateTo: string | null;
  /** Day-by-day breakdown */
  dailyStats: DailyStats[];
  /** Status breakdown */
  statusBreakdown: StatusBreakdown[];
  /** Raw shipments (latest N) */
  recentShipments: Shipment[];
}

export interface AnalyticsFilter {
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
  apiKey: string;    // per-user API key (required)
}

/**
 * Fetch all shipments across pages and compute analytics.
 * Fetches up to maxPages pages to avoid excessive API calls.
 * Optionally filters by date range.
 */
export async function computeShipmentAnalytics(
  filter: AnalyticsFilter,
  maxPages: number = 10,
  perPage: number = 100
): Promise<ShipmentAnalytics> {
  const allShipments: Shipment[] = [];
  let currentPage = 1;
  let lastPage = 1;
  let totalAvailable = 0;

  // Fetch pages
  while (currentPage <= lastPage && currentPage <= maxPages) {
    const result = await getShipments({ page: currentPage, limit: perPage }, filter.apiKey);
    if (!result.success) break;

    allShipments.push(...result.data.items);
    lastPage = result.data.last_page;
    totalAvailable = result.data.total;
    currentPage++;
  }

  // --- Filter by date range ---
  const filteredShipments = allShipments.filter((shipment) => {
    const dateKey = shipment.createdAt
      ? shipment.createdAt.substring(0, 10)
      : null;
    if (!dateKey) return true; // include shipments without date
    if (filter.dateFrom && dateKey < filter.dateFrom) return false;
    if (filter.dateTo && dateKey > filter.dateTo) return false;
    return true;
  });

  // --- Status groups ---
  // The `status` field is the DOCUMENT status (ReadyToShip, Accepted, Issued).
  // The REAL delivery status is in `onlineTracking.tracking_status_code`:
  //   1 = Чекаємо на посилку від вас (waiting for sender)
  //   2 = Видалено (deleted)
  //   3 = Номер не знайдено (not found)
  //   4 = В дорозі (in transit)
  //   5 = В дорозі, дата доставки (in transit, delivery date known)
  //   6 = В місті отримувача / у відділенні (at destination city / at branch)
  //   7 = Отримано (delivered / picked up by recipient)
  //   8 = Відмова / повернення (refused / return)
  //   9 = На зворотній доставці (return in transit)
  //  10 = Отримано повернення (return delivered)
  //  11 = На митниці (customs)
  // Use onlineTracking.tracking_status_code for REAL delivery status
  type TrackingGroup = "delivered" | "atBranch" | "inTransit" | "readyToShip" | "returned" | "other";

  function getTrackingGroup(shipment: Shipment): TrackingGroup {
    const code = shipment.onlineTracking?.tracking_status_code;
    if (code === undefined || code === null) {
      // Fallback to document status if no tracking data
      if (shipment.status === "ReadyToShip" || shipment.status === "Issued" || shipment.status === "Created") return "readyToShip";
      return "other";
    }
    switch (code) {
      case 1:  return "readyToShip";   // Чекаємо на посилку від вас
      case 4:                           // В дорозі
      case 5:                           // В дорозі (дата доставки відома)
      case 11: return "inTransit";      // На митниці
      case 6:  return "atBranch";       // У відділенні / у місті отримувача
      case 7:  return "delivered";        // Отримано (одержувач отримав)
      case 8:                           // Відмова / повернення
      case 9:                           // На зворотній доставці
      case 10: return "returned";       // Повернення отримано відправником
      default: return "other";          // 2=Видалено, 3=Не знайдено, etc.
    }
  }

  /** Human-readable tracking label for status breakdown card */
  function getTrackingLabel(shipment: Shipment): string {
    const desc = shipment.onlineTracking?.short_description;
    if (desc) {
      // Normalize: remove dynamic parts like dates/emojis for grouping
      // "Доставимо 14.02 🚗" → "В дорозі"
      // "Чекаємо на посилку від вас" → as is
      const code = shipment.onlineTracking?.tracking_status_code;
      switch (code) {
        case 1: return "Чекаємо на посилку";
        case 4:
        case 5: return "В дорозі";
        case 6: return "У відділенні";
        case 7: return "Отримано";
        case 8: return "Відмова";
        case 9: return "Повернення в дорозі";
        case 10: return "Повернення отримано";
        case 11: return "На митниці";
        default: return desc;
      }
    }
    return STATUS_LABELS[shipment.status]?.ua || shipment.status || "Невідомо";
  }

  // --- Aggregate ---
  const trackingGroupCounts: Record<TrackingGroup, number> = {
    delivered: 0, atBranch: 0, inTransit: 0, readyToShip: 0, returned: 0, other: 0,
  };
  const statusCounts: Record<string, number> = {};
  const dailyMap: Record<string, DailyStats> = {};
  let totalDeclaredValue = 0;
  let deliveredDeclaredValue = 0;
  let totalDeliveryCost = 0;
  let deliveredDeliveryCost = 0;
  let currencyCode = "UAH";
  let minDate: string | null = null;
  let maxDate: string | null = null;

  for (const shipment of filteredShipments) {
    const group = getTrackingGroup(shipment);
    trackingGroupCounts[group]++;

    // Status breakdown uses normalized tracking description
    const label = getTrackingLabel(shipment);
    statusCounts[label] = (statusCounts[label] || 0) + 1;

    // Costs — separated into declared value and delivery cost
    const declaredVal = getDeclaredValue(shipment);
    const deliveryCst = getDeliveryCost(shipment);
    totalDeclaredValue += declaredVal;
    totalDeliveryCost += deliveryCst;
    if (shipment.currencyCode) currencyCode = shipment.currencyCode;

    if (group === "delivered") {
      deliveredDeclaredValue += declaredVal;
      deliveredDeliveryCost += deliveryCst;
    }

    // Daily aggregation by creation date
    const dateKey = shipment.createdAt
      ? shipment.createdAt.substring(0, 10)
      : "unknown";

    if (dateKey !== "unknown") {
      if (!minDate || dateKey < minDate) minDate = dateKey;
      if (!maxDate || dateKey > maxDate) maxDate = dateKey;
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = {
          date: dateKey,
          shipments: 0,
          delivered: 0,
          returned: 0,
          totalDeclaredValue: 0,
          deliveredDeclaredValue: 0,
          totalDeliveryCost: 0,
          deliveredDeliveryCost: 0,
        };
      }
      dailyMap[dateKey].shipments++;
      dailyMap[dateKey].totalDeclaredValue += declaredVal;
      dailyMap[dateKey].totalDeliveryCost += deliveryCst;

      if (group === "delivered") {
        dailyMap[dateKey].delivered++;
        dailyMap[dateKey].deliveredDeclaredValue += declaredVal;
        dailyMap[dateKey].deliveredDeliveryCost += deliveryCst;
      }
      if (group === "returned") {
        dailyMap[dateKey].returned++;
      }
    }
  }

  const total = filteredShipments.length;
  const deliveredCount = trackingGroupCounts.delivered;
  const atBranchCount = trackingGroupCounts.atBranch;
  const inTransitCount = trackingGroupCounts.inTransit;
  const readyToShipCount = trackingGroupCounts.readyToShip;
  const returnedCount = trackingGroupCounts.returned;
  const returnedPercentage = total > 0 ? (returnedCount / total) * 100 : 0;

  // Status breakdown sorted by count desc
  // statusCounts keys are now human-readable tracking labels (Ukrainian)
  const statusBreakdown: StatusBreakdown[] = Object.entries(statusCounts)
    .map(([label, count]) => ({
      status: label,
      label,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Daily stats sorted by date
  const dailyStats = Object.values(dailyMap).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return {
    totalShipments: total,
    totalAvailable,
    loadedShipments: allShipments.length,
    deliveredCount,
    atBranchCount,
    inTransitCount,
    readyToShipCount,
    returnedCount,
    returnedPercentage,
    totalDeclaredValue,
    deliveredDeclaredValue,
    totalDeliveryCost,
    deliveredDeliveryCost,
    currencyCode,
    dateFrom: minDate,
    dateTo: maxDate,
    dailyStats,
    statusBreakdown,
    recentShipments: filteredShipments.slice(0, 50),
  };
}
