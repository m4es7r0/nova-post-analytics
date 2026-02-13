"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { IconSearch, IconX } from "@tabler/icons-react";
import type { Shipment } from "@/entities/shipment/model/types";
import {
  getDeliveryCost,
  getDeclaredValue,
  getPayerLabel,
  formatCost,
} from "@/entities/shipment/lib/cost-utils";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

// ----------------------------------------------------------
// Constants
// ----------------------------------------------------------

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

const PER_PAGE_OPTIONS = [25, 50, 100];

// ----------------------------------------------------------
// Component
// ----------------------------------------------------------

interface ShipmentsViewProps {
  shipments: Shipment[];
  total: number;
  totalAvailable: number;
  loadedTotal: number;
  page: number;
  lastPage: number;
  perPage: number;
  dateFrom: string;
  dateTo: string;
}

export function ShipmentsView({
  shipments,
  total,
  totalAvailable,
  loadedTotal,
  page,
  lastPage,
  perPage,
  dateFrom,
  dateTo,
}: ShipmentsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Client-side text search (filter current page only)
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!search.trim()) return shipments;
    const q = search.toLowerCase();
    return shipments.filter(
      (s) =>
        s.number?.toLowerCase().includes(q) ||
        s.sender?.name?.toLowerCase().includes(q) ||
        s.recipient?.name?.toLowerCase().includes(q) ||
        s.recipient?.addressParts?.city?.toLowerCase().includes(q) ||
        (s.onlineTracking?.short_description || s.status)?.toLowerCase().includes(q)
    );
  }, [shipments, search]);

  // --- URL helpers ---
  function buildUrl(overrides: Record<string, string | number>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(overrides)) {
      params.set(key, String(value));
    }
    return `${pathname}?${params.toString()}`;
  }

  function handlePerPageChange(value: string) {
    router.push(buildUrl({ perPage: value, page: 1 }));
  }

  const hasSearch = search.trim().length > 0;

  return (
    <>
      {/* Header & search */}
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div>
          <h2 className="text-lg font-semibold">Всі відправлення</h2>
          <p className="text-sm text-muted-foreground">
            {total.toLocaleString("uk-UA")} відправлень за обраний період
            {totalAvailable > loadedTotal && (
              <span className="ml-1 text-xs">
                (завантажено {loadedTotal.toLocaleString("uk-UA")} з{" "}
                {totalAvailable.toLocaleString("uk-UA")})
              </span>
            )}
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Пошук за номером, відправником, отримувачем..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <IconX className="size-4" />
            </button>
          )}
        </div>

        {hasSearch && (
          <p className="text-sm text-muted-foreground">
            Знайдено {filtered.length} з {shipments.length} на сторінці
          </p>
        )}
      </div>

      {/* Table */}
      <div className="px-4 lg:px-6">
        {filtered.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            {hasSearch
              ? "Відправлення не знайдено за вашим запитом."
              : "Відправлення не знайдено за обраний період."}
          </div>
        ) : (
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
                {filtered.map((shipment) => {
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
                      <TableCell className="max-w-[150px] truncate" title={shipment.sender?.name}>
                        {shipment.sender?.name || "—"}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate" title={shipment.recipient?.name}>
                        {shipment.recipient?.name || "—"}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {shipment.recipient?.addressParts?.city || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {shipment.parcelsAmount}
                      </TableCell>
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
        )}
      </div>

      {/* Footer: per-page + pagination */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 lg:px-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">На сторінці:</span>
          <Select
            value={String(perPage)}
            onValueChange={handlePerPageChange}
          >
            <SelectTrigger className="w-[80px]" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PER_PAGE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!hasSearch && lastPage > 1 && (
          <div className="flex items-center gap-2">
            {page > 1 && (
              <a
                href={buildUrl({ page: page - 1 })}
                className="inline-flex items-center rounded-md border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Попередня
              </a>
            )}
            <span className="text-sm text-muted-foreground">
              Сторінка {page} з {lastPage}
            </span>
            {page < lastPage && (
              <a
                href={buildUrl({ page: page + 1 })}
                className="inline-flex items-center rounded-md border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Наступна
              </a>
            )}
          </div>
        )}
      </div>
    </>
  );
}
