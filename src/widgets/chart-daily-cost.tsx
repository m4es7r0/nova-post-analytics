"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { useIsMobile } from "@/shared/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";

interface DailyData {
  date: string;
  totalDeclaredValue: number;
  deliveredDeclaredValue: number;
  totalDeliveryCost: number;
  deliveredDeliveryCost: number;
  shipments: number;
  delivered: number;
}

interface ChartDailyCostProps {
  data?: DailyData[];
  currencyCode?: string;
}

const chartConfig = {
  totalDeclaredValue: {
    label: "Оголошена вартість",
    color: "var(--chart-1)",
  },
  totalDeliveryCost: {
    label: "Вартість доставки",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const PRESET_DAYS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export function ChartDailyCost({
  data = [],
  currencyCode = "UAH",
}: ChartDailyCostProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [timeRange, setTimeRange] = React.useState("7d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  /** When user picks a time range preset, update URL from/to params */
  const handleTimeRangeChange = React.useCallback(
    (value: string) => {
      if (!value) return;
      setTimeRange(value);

      const days = PRESET_DAYS[value] || 30;
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - days);

      const params = new URLSearchParams(searchParams.toString());
      params.set("from", format(from, "yyyy-MM-dd"));
      params.set("to", format(to, "yyyy-MM-dd"));
      router.push(`/dashboard?${params.toString()}`);
    },
    [router, searchParams],
  );

  const filteredData = React.useMemo(() => {
    if (data.length === 0) return [];

    const now = new Date();
    const daysToSubtract = PRESET_DAYS[timeRange] || 30;

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return data.filter((item) => new Date(item.date) >= startDate);
  }, [data, timeRange]);

  const totalDeclared = filteredData.reduce((s, d) => s + d.totalDeclaredValue, 0);
  const totalDelivery = filteredData.reduce((s, d) => s + d.totalDeliveryCost, 0);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Вартість по днях</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:inline">
            Оголошена: {totalDeclared.toLocaleString("uk-UA", { minimumFractionDigits: 2 })}{" "}
            {currencyCode} | Доставка:{" "}
            {totalDelivery.toLocaleString("uk-UA", { minimumFractionDigits: 2 })}{" "}
            {currencyCode}
          </span>
          <span className="@[540px]/card:hidden">
            {totalDeclared.toLocaleString("uk-UA", { minimumFractionDigits: 2 })}{" "}
            {currencyCode}
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={handleTimeRangeChange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">3 місяці</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 днів</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 днів</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Оберіть період"
            >
              <SelectValue placeholder="30 днів" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                3 місяці
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                30 днів
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                7 днів
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {filteredData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            Немає даних за обраний період
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart data={filteredData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("uk-UA", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={60}
                tickFormatter={(value) => {
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                  return value.toString();
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("uk-UA", {
                        weekday: "short",
                        month: "long",
                        day: "numeric",
                      });
                    }}
                    formatter={(value) => (
                      <span>
                        {Number(value).toLocaleString("uk-UA", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        {currencyCode}
                      </span>
                    )}
                    indicator="dot"
                  />
                }
              />
              <Bar
                dataKey="totalDeliveryCost"
                fill="var(--color-totalDeliveryCost)"
                radius={[0, 0, 4, 4]}
                stackId="cost"
              />
              <Bar
                dataKey="totalDeclaredValue"
                fill="var(--color-totalDeclaredValue)"
                radius={[4, 4, 0, 0]}
                stackId="cost"
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
