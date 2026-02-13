"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/chart"

interface StatusItem {
  status: string
  label: string
  count: number
  percentage: number
}

interface StatusBreakdownProps {
  data: StatusItem[]
  total: number
}

/** Color mapping for tracking status labels (Ukrainian) */
const STATUS_COLORS: Record<string, string> = {
  "Чекаємо на посилку": "var(--chart-4)",    // orange — waiting for sender
  "В дорозі": "var(--chart-3)",               // yellow — in transit
  "У відділенні": "var(--chart-1)",            // blue — at branch
  "Отримано": "var(--chart-2)",                // green — delivered
  "Відмова": "var(--chart-5)",                 // red — refused
  "Повернення в дорозі": "var(--chart-5)",     // red — return in transit
  "Повернення отримано": "var(--chart-5)",      // red — return delivered
  "На митниці": "var(--chart-4)",              // orange — customs
}

/** Get color by label, with fallback cycling through chart colors */
function getStatusColor(label: string): string {
  if (STATUS_COLORS[label]) return STATUS_COLORS[label];
  // Deterministic fallback based on label hash
  const chartColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = ((hash << 5) - hash + label.charCodeAt(i)) | 0;
  return chartColors[Math.abs(hash) % chartColors.length];
}

const chartConfig = {
  count: {
    label: "Кількість",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function StatusBreakdown({ data, total }: StatusBreakdownProps) {
  const chartData = data.map((item) => ({
    ...item,
    fill: getStatusColor(item.label),
  }))

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Розподіл по статусам</CardTitle>
        <CardDescription>
          {total} відправлень всього
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            Немає даних
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart data={chartData} layout="vertical" margin={{ left: 0 }}>
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="label"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={140}
                  tickMargin={8}
                  className="text-xs"
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => value}
                      formatter={(value, name, item) => (
                        <span>
                          {value} ({item.payload.percentage.toFixed(1)}%)
                        </span>
                      )}
                    />
                  }
                />
                <Bar dataKey="count" radius={4} />
              </BarChart>
            </ChartContainer>
            <div className="grid grid-cols-2 gap-2 @[400px]/card:grid-cols-3">
              {data.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center gap-2 rounded-md border px-3 py-2"
                >
                  <div
                    className="size-3 rounded-full shrink-0"
                    style={{ backgroundColor: getStatusColor(item.label) }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{item.label}</p>
                    <p className="text-sm font-semibold tabular-nums">
                      {item.count}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        ({item.percentage.toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
