"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  IconSearch,
  IconMapPin,
  IconX,
  IconCheck,
  IconSelector,
} from "@tabler/icons-react";
import type { Division } from "@/entities/division/model/types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
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
import { cn } from "@/shared/lib/utils";

// ----------------------------------------------------------
// Constants
// ----------------------------------------------------------

const CATEGORY_LABELS: Record<string, string> = {
  PostBranch: "Відділення",
  PostLocker: "Поштомат",
  CargoBranch: "Вантажне відділення",
};

const CATEGORY_COLORS: Record<string, string> = {
  PostBranch: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  PostLocker: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  CargoBranch: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

const PER_PAGE_OPTIONS = [25, 50, 100];

function formatScheduleDay(value: string): string {
  if (!value || value === "-") return "—";
  return value;
}

/** Get city name from division's settlement object or fallback to address parsing */
function getCityName(division: Division): string {
  if (division.settlement?.name) return division.settlement.name;
  // Fallback: parse from address
  const parts = (division.address || "").split(",").map((p) => p.trim());
  for (const part of parts) {
    if (!part) continue;
    if (/^\d+$/.test(part)) continue;
    if (part === "Україна" || part === "Ukraine") continue;
    if (/область$/i.test(part)) continue;
    if (/район$/i.test(part)) continue;
    if (/^(вул\.|просп\.|бульв\.|пров\.|пл\.)/i.test(part)) continue;
    return part;
  }
  return "Інше";
}

// ----------------------------------------------------------
// Component
// ----------------------------------------------------------

interface SettlementOption {
  id: number;
  name: string;
}

interface DivisionsViewProps {
  divisions: Division[];
  settlements: SettlementOption[];
  total: number;
  page: number;
  lastPage: number;
  perPage: number;
  activeSettlementId?: number;
  activeSettlementName?: string;
}

export function DivisionsView({
  divisions,
  settlements,
  total,
  page,
  lastPage,
  perPage,
  activeSettlementId,
  activeSettlementName,
}: DivisionsViewProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [cityOpen, setCityOpen] = React.useState(false);

  // Client-side search on the loaded page data (API doesn't support text search)
  const filtered = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return divisions;
    return divisions.filter((div) => {
      const haystack = [div.name, div.shortName, div.number, div.address, getCityName(div)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [divisions, search]);

  // Build URL with current params
  const buildUrl = React.useCallback(
    (overrides: { page?: number; perPage?: number; settlementId?: number | null; settlementName?: string | null } = {}) => {
      const params = new URLSearchParams();
      params.set("page", String(overrides.page ?? page));
      params.set("perPage", String(overrides.perPage ?? perPage));

      const sId = overrides.settlementId !== undefined ? overrides.settlementId : activeSettlementId;
      const sName = overrides.settlementName !== undefined ? overrides.settlementName : activeSettlementName;

      if (sId) params.set("settlementId", String(sId));
      if (sName) params.set("settlementName", sName);

      return `/dashboard/divisions?${params.toString()}`;
    },
    [page, perPage, activeSettlementId, activeSettlementName]
  );

  // City select: navigate to server-side filtered URL
  const handleCitySelect = React.useCallback(
    (settlementId: number | null, settlementName: string | null) => {
      setCityOpen(false);
      router.push(buildUrl({
        page: 1,
        settlementId: settlementId,
        settlementName: settlementName,
      }));
    },
    [router, buildUrl]
  );

  const handlePerPageChange = React.useCallback(
    (value: string) => {
      router.push(buildUrl({ page: 1, perPage: parseInt(value, 10) }));
    },
    [router, buildUrl]
  );

  const clearAll = React.useCallback(() => {
    setSearch("");
    if (activeSettlementId) {
      router.push(buildUrl({ page: 1, settlementId: null, settlementName: null }));
    }
  }, [router, buildUrl, activeSettlementId]);

  const hasFilters = !!(search || activeSettlementId);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Мережа відділень</h2>
            <p className="text-sm text-muted-foreground">
              {search
                ? `Знайдено ${filtered.length} з ${divisions.length} на сторінці`
                : `${total.toLocaleString("uk-UA")} відділень`}
              {activeSettlementName && (
                <span className="ml-1">
                  у м. <strong>{activeSettlementName}</strong>
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* City combobox — selects settlementId, triggers server-side filter */}
            <Popover open={cityOpen} onOpenChange={setCityOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={cityOpen}
                  className="w-[240px] justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    <IconMapPin className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">
                      {activeSettlementName || "Всі міста"}
                    </span>
                  </div>
                  <IconSelector className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0" align="end">
                <Command>
                  <CommandInput placeholder="Пошук міста..." />
                  <CommandList>
                    <CommandEmpty>Місто не знайдено на цій сторінці</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="__all__"
                        onSelect={() => handleCitySelect(null, null)}
                      >
                        <IconCheck
                          className={cn(
                            "mr-2 size-4",
                            !activeSettlementId ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Всі міста
                      </CommandItem>
                      {settlements.map((s) => (
                        <CommandItem
                          key={s.id}
                          value={s.name}
                          onSelect={() => handleCitySelect(s.id, s.name)}
                        >
                          <IconCheck
                            className={cn(
                              "mr-2 size-4",
                              activeSettlementId === s.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <span className="truncate">{s.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Client-side search (API doesn't support text search) */}
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Пошук за назвою, номером..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-[260px]"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <IconX className="size-4" />
                </button>
              )}
            </div>

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                <IconX className="mr-1 size-3.5" />
                Скинути
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-4 lg:px-6">
        {filtered.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            {hasFilters
              ? "Відділення не знайдено за вашим запитом."
              : "Відділення не знайдено."}
          </div>
        ) : (
          <div className="rounded-lg border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Номер</TableHead>
                  <TableHead>Назва</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Місто</TableHead>
                  <TableHead>Адреса</TableHead>
                  <TableHead>Макс. вага</TableHead>
                  <TableHead>Пн–Пт</TableHead>
                  <TableHead>Сб</TableHead>
                  <TableHead className="text-right">Нд</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((div) => (
                  <TableRow key={div.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {div.number}
                    </TableCell>
                    <TableCell
                      className="max-w-[220px] truncate"
                      title={div.name}
                    >
                      {div.shortName || div.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={CATEGORY_COLORS[div.category] || ""}
                      >
                        {CATEGORY_LABELS[div.category] || div.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {getCityName(div)}
                    </TableCell>
                    <TableCell
                      className="max-w-[250px] truncate text-sm"
                      title={div.address}
                    >
                      {div.address}
                    </TableCell>
                    <TableCell className="text-center tabular-nums text-sm">
                      {div.maxWeight ? `${div.maxWeight} кг` : "—"}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {formatScheduleDay(div.schedule?.monday)}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {formatScheduleDay(div.schedule?.saturday)}
                    </TableCell>
                    <TableCell className="text-right text-xs whitespace-nowrap">
                      {formatScheduleDay(div.schedule?.sunday)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Footer: per-page + server pagination */}
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

        {/* Server-side pagination */}
        {lastPage > 1 && (
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
