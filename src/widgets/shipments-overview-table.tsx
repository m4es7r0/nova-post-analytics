"use client";

import type { Shipment } from "@/entities/shipment/model/types";
import {
  getDeliveryCost,
  getDeclaredValue,
  getPayerLabel,
  formatCost,
} from "@/entities/shipment/lib/cost-utils";
import { Badge } from "@/shared/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

/** Badge color by onlineTracking.label (Nova Post API color hint) */
const TRACKING_LABEL_COLORS: Record<string, string> = {
  green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  orange: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

function getTrackingBadge(shipment: Shipment) {
  const desc = shipment.onlineTracking?.short_description;
  const colorLabel = shipment.onlineTracking?.label || "";
  const colorClass = TRACKING_LABEL_COLORS[colorLabel] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  const text = desc || shipment.status || "—";
  return { text, colorClass };
}

interface ShipmentsOverviewTableProps {
  shipments: Shipment[];
}

export function ShipmentsOverviewTable({ shipments }: ShipmentsOverviewTableProps) {
  if (shipments.length === 0) {
    return (
      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Відправлення не знайдено. Створіть першу відправку, щоб бачити дані тут.
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-3">
        <h3 className="text-lg font-semibold">Останні відправлення</h3>
        <p className="text-sm text-muted-foreground">
          {shipments.length} відправлень
        </p>
      </div>
      <div className="rounded-lg border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Номер</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Відправник</TableHead>
              <TableHead>Отримувач</TableHead>
              <TableHead>Місто</TableHead>
              <TableHead className="text-center">Посилок</TableHead>
              <TableHead className="text-right">Оголошена вартість</TableHead>
              <TableHead className="text-right">Доставка</TableHead>
              <TableHead className="text-right">Створено</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments.map((shipment) => {
              const badge = getTrackingBadge(shipment);
              const declaredValue = getDeclaredValue(shipment);
              const deliveryCost = getDeliveryCost(shipment);
              const payer = getPayerLabel(shipment.payerType);
              const currency = shipment.currencyCode || "UAH";

              return (
                <TableRow key={shipment.id}>
                  <TableCell className="font-medium font-mono text-sm">
                    {shipment.number}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={badge.colorClass}>
                      {badge.text}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {shipment.sender?.name || "—"}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {shipment.recipient?.name || "—"}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {shipment.recipient?.addressParts?.city || "—"}
                  </TableCell>
                  <TableCell className="text-center">{shipment.parcelsAmount}</TableCell>
                  <TableCell className="text-right font-mono whitespace-nowrap">
                    {formatCost(declaredValue, currency)}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <span className="font-mono">{formatCost(deliveryCost, currency)}</span>
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      ({payer})
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground whitespace-nowrap">
                    {new Date(shipment.createdAt).toLocaleDateString("uk-UA")}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
