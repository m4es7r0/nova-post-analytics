import type { Shipment } from "../model/types";

// ============================================================
// Shipment Cost Utilities
// Shared between server analytics and client UI components
// ============================================================

/**
 * Extract the pure delivery/shipping cost from services,
 * EXCLUDING the COD collection amount ("Контроль оплати").
 *
 * "Контроль оплати" is the cash-on-delivery sum collected from
 * the recipient — it equals `totalInsuranceCost` (declared value)
 * and is NOT a shipping fee.
 */
export function getDeliveryCost(shipment: Shipment): number {
  if (!shipment.services?.length) return 0;
  return shipment.services
    .filter((s) => !s.service_name?.includes("Контроль оплати"))
    .reduce((sum, s) => sum + (s.cost || 0), 0);
}

/**
 * Get the declared value of goods (оголошена вартість).
 * Falls back to the "Контроль оплати" service cost if
 * totalInsuranceCost is 0 but COD is present.
 */
export function getDeclaredValue(shipment: Shipment): number {
  if (shipment.totalInsuranceCost) return shipment.totalInsuranceCost;
  // Fallback: look for COD service
  const codService = shipment.services?.find((s) =>
    s.service_name?.includes("Контроль оплати")
  );
  return codService?.cost || 0;
}

/** Translate payerType to Ukrainian */
export function getPayerLabel(payerType: string | undefined | null): string {
  switch (payerType) {
    case "Sender":
      return "Відправник";
    case "Recipient":
      return "Отримувач";
    default:
      return payerType || "—";
  }
}

/** Format cost as "1 234.50 UAH" */
export function formatCost(
  value: number,
  currency: string = "UAH"
): string {
  return `${value.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}
