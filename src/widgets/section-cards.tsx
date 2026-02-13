import {
  IconTrendingDown,
  IconTrendingUp,
  IconPackage,
  IconPackageExport,
  IconBuildingWarehouse,
  IconArrowBack,
  IconTruck,
  IconCurrencyDollar,
  IconShieldDollar,
} from "@tabler/icons-react"

import { Badge } from "@/shared/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"

interface SectionCardsProps {
  totalShipments: number
  deliveredCount: number
  atBranchCount: number
  inTransitCount: number
  readyToShipCount: number
  returnedCount: number
  returnedPercentage: number
  totalDeclaredValue: number
  deliveredDeclaredValue: number
  totalDeliveryCost: number
  deliveredDeliveryCost: number
  currencyCode: string
}

function fmtCost(value: number, currency: string) {
  return `${value.toLocaleString("uk-UA", { minimumFractionDigits: 2 })} ${currency}`
}

export function SectionCards({
  totalShipments,
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
}: SectionCardsProps) {
  return (
    <>
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Total Shipments */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Всього відправлень</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalShipments.toLocaleString("uk-UA")}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconPackage className="size-3.5" />
              Всі
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconTruck className="size-4" />
            В дорозі: {inTransitCount} | Очікує: {readyToShipCount}
          </div>
          <div className="text-muted-foreground">
            Всі створені відправлення в системі
          </div>
        </CardFooter>
      </Card>

      {/* Delivered */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Доставлено / Отримано</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {deliveredCount.toLocaleString("uk-UA")}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-700 dark:text-green-400">
              <IconPackageExport className="size-3.5" />
              {totalShipments > 0
                ? ((deliveredCount / totalShipments) * 100).toFixed(1)
                : "0"}
              %
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Успішно доставлені посилки <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Оголошена вартість: {fmtCost(deliveredDeclaredValue, currencyCode)}
          </div>
        </CardFooter>
      </Card>

      {/* At Branch */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>У відділенні</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {atBranchCount.toLocaleString("uk-UA")}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-blue-700 dark:text-blue-400">
              <IconBuildingWarehouse className="size-3.5" />
              Очікують
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Посилки у відділенні
          </div>
          <div className="text-muted-foreground">
            Очікують отримання клієнтом
          </div>
        </CardFooter>
      </Card>

      {/* Returns / Refusals */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Відмови / Повернення</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {returnedCount.toLocaleString("uk-UA")}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={
                returnedPercentage > 5
                  ? "text-red-700 dark:text-red-400"
                  : "text-muted-foreground"
              }
            >
              {returnedPercentage > 5 ? (
                <IconTrendingDown className="size-3.5" />
              ) : (
                <IconArrowBack className="size-3.5" />
              )}
              {returnedPercentage.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {returnedPercentage > 5 ? (
              <>Потребує уваги <IconTrendingDown className="size-4" /></>
            ) : (
              <>Нормальний рівень <IconTrendingUp className="size-4" /></>
            )}
          </div>
          <div className="text-muted-foreground">
            Відсоток відмов від загальної кількості
          </div>
        </CardFooter>
      </Card>
    </div>

    {/* Second row - Financial */}
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 mt-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Оголошена вартість (всього)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {fmtCost(totalDeclaredValue, currencyCode)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconShieldDollar className="size-3.5" />
              Вартість товарів
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Доставлено на {fmtCost(deliveredDeclaredValue, currencyCode)}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Вартість доставки (всього)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {fmtCost(totalDeliveryCost, currencyCode)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-orange-700 dark:text-orange-400">
              <IconCurrencyDollar className="size-3.5" />
              Витрати
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Доставлено на {fmtCost(deliveredDeliveryCost, currencyCode)}
          </div>
        </CardFooter>
      </Card>
    </div>
    </>
  )
}
