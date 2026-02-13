"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

interface TrackingResult {
  id: string;
  number: string;
  scheduled_delivery_date: string;
  history_tracking: {
    code: string;
    code_name: string;
    country_code: string;
    settlement: string;
    date: string;
  }[];
}

export function TrackingSearch() {
  const [numbers, setNumbers] = useState("");
  const [results, setResults] = useState<TrackingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResults([]);

    const numbersList = numbers
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);

    if (numbersList.length === 0) {
      setError("Please enter at least one shipment number");
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      numbersList.forEach((n) => params.append("numbers[]", n));

      const response = await fetch(
        `/api/nova-post/shipments/tracking/history?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tracking data");
      }

      const data = await response.json();
      setResults(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1">
          <Label htmlFor="numbers" className="sr-only">
            Shipment Numbers
          </Label>
          <Input
            id="numbers"
            placeholder="Enter shipment numbers (comma separated), e.g. SHPL2524572231, SHPL2896131485"
            value={numbers}
            onChange={(e) => setNumbers(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Track"}
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {results.length > 0 && (
        <div className="flex flex-col gap-4">
          {results.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="font-mono text-lg">
                  {item.number}
                </CardTitle>
                <CardDescription>
                  Estimated delivery:{" "}
                  {new Date(item.scheduled_delivery_date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {item.history_tracking.map((event, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 border-l-2 border-primary/20 pl-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">
                            {event.code_name}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {event.country_code}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {event.settlement} &middot;{" "}
                          {new Date(event.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
