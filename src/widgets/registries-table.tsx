"use client";

import type { Registry } from "@/entities/registry/model/types";
import { Badge } from "@/shared/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

interface RegistriesTableProps {
  registries: Registry[];
}

export function RegistriesTable({ registries }: RegistriesTableProps) {
  if (registries.length === 0) {
    return (
      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          No registries found. Create a shipment registry to see data here.
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
              <TableHead>Description</TableHead>
              <TableHead>Sender</TableHead>
              <TableHead>Shipments</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registries.map((registry) => (
              <TableRow key={registry.id}>
                <TableCell className="font-medium font-mono text-sm">
                  {registry.number}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {registry.description}
                </TableCell>
                <TableCell>
                  <div className="text-sm">{registry.senderSettlementName}</div>
                  <div className="text-xs text-muted-foreground">
                    {registry.senderCountryCode}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {registry.shipments.length} shipment{registry.shipments.length !== 1 ? "s" : ""}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={registry.printed ? "default" : "secondary"}>
                    {registry.printed ? "Printed" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(registry.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
