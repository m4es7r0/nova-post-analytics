"use client";

import type { Pickup } from "@/entities/pickup/model/types";
import { Badge } from "@/shared/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

const statusColors: Record<string, string> = {
  New: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  InProgress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

interface PickupsTableProps {
  pickups: Pickup[];
}

export function PickupsTable({ pickups }: PickupsTableProps) {
  if (pickups.length === 0) {
    return (
      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          No pickups found. Schedule a courier pickup to see data here.
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Pickup Time</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pickups.map((pickup) => (
              <TableRow key={pickup.id}>
                <TableCell className="font-medium font-mono text-sm">
                  {pickup.number}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={statusColors[pickup.status] || ""}
                  >
                    {pickup.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{pickup.fullName}</div>
                  <div className="text-xs text-muted-foreground">{pickup.phone}</div>
                </TableCell>
                <TableCell className="max-w-[250px] truncate text-sm">
                  {pickup.addressParts?.city}, {pickup.addressParts?.street} {pickup.addressParts?.building}
                </TableCell>
                <TableCell className="text-sm">
                  {new Date(pickup.pickedTimeFrom).toLocaleString()} -{" "}
                  {new Date(pickup.pickedTimeTo).toLocaleTimeString()}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(pickup.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
