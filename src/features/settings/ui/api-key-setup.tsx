"use client";

import * as React from "react";
import { IconKey, IconCheck, IconLoader2, IconPackage } from "@tabler/icons-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

/**
 * Full-screen setup page shown when user has no API key configured.
 * Blocks access to all dashboard features until key is added.
 */
export function ApiKeySetup() {
  const [apiKey, setApiKey] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSave = async () => {
    if (!apiKey.trim()) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/settings/api-key", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "API ключ збережено! Перенаправляємо..." });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage({ type: "error", text: data.error || "Помилка збереження" });
      }
    } catch {
      setMessage({ type: "error", text: "Помилка з'єднання з сервером" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Logo / Branding */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <IconPackage className="size-7" />
          </div>
          <h1 className="text-2xl font-bold">Nova Post Analytics</h1>
          <p className="text-muted-foreground max-w-sm">
            Для початку роботи необхідно налаштувати ваш персональний API ключ Nova Poshta
          </p>
        </div>

        {/* Setup card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconKey className="size-5" />
              Налаштування API ключа
            </CardTitle>
            <CardDescription>
              Введіть ваш API ключ для доступу до аналітики відправлень.
              Ключ буде перевірено перед збереженням.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-medium">
                API ключ
              </label>
              <div className="flex gap-2">
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Вставте ваш API ключ..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && apiKey.trim()) handleSave();
                  }}
                  className="font-mono"
                  autoFocus
                />
                <Button onClick={handleSave} disabled={saving || !apiKey.trim()}>
                  {saving ? (
                    <IconLoader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <IconCheck className="mr-2 size-4" />
                  )}
                  Зберегти
                </Button>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`rounded-md px-4 py-3 text-sm ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
                    : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Instructions */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <h4 className="text-sm font-medium">Де отримати API ключ?</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>
                  Перейдіть до{" "}
                  <a
                    href="https://new.novaposhta.ua"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    бізнес-кабінету Nova Poshta
                  </a>
                </li>
                <li>Відкрийте Налаштування → Безпека</li>
                <li>Натисніть &quot;Створити ключ&quot;</li>
                <li>Скопіюйте ключ та вставте його вище</li>
              </ol>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Ваш ключ зберігається безпечно на сервері та ніколи не передається на клієнт
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
