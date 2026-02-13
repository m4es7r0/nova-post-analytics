"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { uk } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { IconCalendar, IconX } from "@tabler/icons-react";

import { cn } from "@/shared/lib/utils";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

/** Clamp a date so it never exceeds today */
function clampToToday(d: Date): Date {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return d > today ? today : d;
}

/** Returns current week range (Mon–today, never into the future) */
function getCurrentWeekRange(): { from: Date; to: Date } {
  const now = new Date();
  return {
    from: startOfWeek(now, { weekStartsOn: 1 }),
    to: clampToToday(endOfWeek(now, { weekStartsOn: 1 })),
  };
}

interface DateRangeFilterProps {
  className?: string;
  /** Base pathname for URL updates (default: current pathname) */
  basePath?: string;
}

export function DateRangeFilter({ className, basePath }: DateRangeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const currentPath = basePath || pathname;

  const paramFrom = searchParams.get("from");
  const paramTo = searchParams.get("to");

  // Default to current week
  const defaultWeek = React.useMemo(() => getCurrentWeekRange(), []);

  const [date, setDateRaw] = React.useState<DateRange | undefined>(() => {
    if (paramFrom || paramTo) {
      return {
        from: paramFrom ? new Date(paramFrom) : undefined,
        to: paramTo ? clampToToday(new Date(paramTo)) : undefined,
      };
    }
    // Default: current week
    return defaultWeek;
  });

  /** Wrapper that always clamps `to` to today */
  const setDate = React.useCallback((range: DateRange | undefined) => {
    if (range?.to) {
      setDateRaw({ ...range, to: clampToToday(range.to) });
    } else {
      setDateRaw(range);
    }
  }, []);

  // On first render, if URL has no params → redirect with current week
  const hasRedirected = React.useRef(false);
  React.useEffect(() => {
    if (!paramFrom && !paramTo && !hasRedirected.current) {
      hasRedirected.current = true;
      const params = new URLSearchParams(searchParams.toString());
      params.set("from", format(defaultWeek.from, "yyyy-MM-dd"));
      params.set("to", format(defaultWeek.to, "yyyy-MM-dd"));
      router.replace(`${currentPath}?${params.toString()}`);
    }
  }, [paramFrom, paramTo, defaultWeek, router, searchParams, currentPath]);

  const [open, setOpen] = React.useState(false);

  const applyFilter = React.useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (date?.from) {
      params.set("from", format(date.from, "yyyy-MM-dd"));
    } else {
      params.delete("from");
    }

    if (date?.to) {
      params.set("to", format(clampToToday(date.to), "yyyy-MM-dd"));
    } else {
      params.delete("to");
    }

    router.push(`${currentPath}?${params.toString()}`);
    setOpen(false);
  }, [date, router, searchParams, currentPath]);

  const resetToWeek = React.useCallback(() => {
    const week = getCurrentWeekRange();
    setDate(week);
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", format(week.from, "yyyy-MM-dd"));
    params.set("to", format(clampToToday(week.to), "yyyy-MM-dd"));
    router.push(`${currentPath}?${params.toString()}`);
  }, [router, searchParams, setDate, currentPath]);

  // Quick presets
  const setPreset = React.useCallback((days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    setDate({ from, to });
  }, []);

  const setPresetWeek = React.useCallback(() => {
    setDate(getCurrentWeekRange());
  }, []);

  // Check if current filter differs from default week
  const isCustomFilter = React.useMemo(() => {
    if (!paramFrom || !paramTo) return false;
    const weekFrom = format(defaultWeek.from, "yyyy-MM-dd");
    const weekTo = format(defaultWeek.to, "yyyy-MM-dd");
    return paramFrom !== weekFrom || paramTo !== weekTo;
  }, [paramFrom, paramTo, defaultWeek]);

  const label = React.useMemo(() => {
    // Shorter format on mobile to save space
    const fmt = isMobile ? "d.MM" : "d MMM yyyy";
    if (date?.from && date?.to) {
      return `${format(date.from, fmt, { locale: uk })} — ${format(date.to, fmt, { locale: uk })}`;
    }
    if (date?.from) {
      return `З ${format(date.from, fmt, { locale: uk })}`;
    }
    return "Оберіть період";
  }, [date, isMobile]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={isCustomFilter ? "default" : "ghost"}
            size={isMobile ? "sm" : "default"}
            className="justify-start text-left font-normal"
          >
            <IconCalendar className="size-4 shrink-0" />
            <span className="truncate">{label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto max-w-[calc(100vw-2rem)] p-0"
          align={isMobile ? "start" : "end"}
          collisionPadding={16}
        >
          <div className="flex flex-col">
            {/* Quick presets */}
            <div className="grid grid-cols-3 gap-1 border-b p-3 sm:flex sm:flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={setPresetWeek}
              >
                Тиждень
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setPreset(14)}
              >
                14 днів
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setPreset(30)}
              >
                30 днів
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setPreset(90)}
              >
                3 місяці
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setPreset(180)}
              >
                6 місяців
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setPreset(365)}
              >
                Рік
              </Button>
            </div>
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={isMobile ? 1 : 2}
              locale={uk}
              disabled={{ after: new Date() }}
              toDate={new Date()}
              className="max-sm:w-full"
            />
            <div className="flex items-center justify-between border-t p-3">
              <p className="text-xs text-muted-foreground">
                {date?.from && date?.to
                  ? `${Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24))} днів`
                  : "Оберіть діапазон дат"}
              </p>
              <Button size="sm" onClick={applyFilter} disabled={!date?.from}>
                Застосувати
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {isCustomFilter && (
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={resetToWeek}
          title="Скинути на поточний тиждень"
        >
          <IconX className="size-4" />
          <span className="sr-only">Скинути</span>
        </Button>
      )}
    </div>
  );
}
