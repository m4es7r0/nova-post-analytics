"use client";

import * as React from "react";
import { IconKey, IconCheck, IconTrash, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";

interface ApiKeyFormProps {
  currentKey: string | null;
}

export function ApiKeyForm({ currentKey }: ApiKeyFormProps) {
  const [apiKey, setApiKey] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [message, setMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [hasKey, setHasKey] = React.useState(!!currentKey);

  const maskedKey = React.useMemo(() => {
    if (!currentKey) return null;
    if (currentKey.length <= 8) return "••••••••";
    return currentKey.slice(0, 4) + "••••••••" + currentKey.slice(-4);
  }, [currentKey]);

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
        setMessage({ type: "success", text: data.message || "API ключ збережено" });
        setHasKey(true);
        setApiKey("");
        // Reload page to pick up new key
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ type: "error", text: data.error || "Помилка збереження" });
      }
    } catch {
      setMessage({ type: "error", text: "Помилка з'єднання з сервером" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/settings/api-key", {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message || "API ключ видалено" });
        setHasKey(false);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ type: "error", text: data.error || "Помилка видалення" });
      }
    } catch {
      setMessage({ type: "error", text: "Помилка з'єднання з сервером" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconKey className="size-5" />
          API ключ Nova Poshta
        </CardTitle>
        <CardDescription>
          Додайте свій персональний API ключ для роботи з Nova Poshta API.
          Кожен зареєстрований користувач може використовувати власний ключ для безпеки та ізоляції даних.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current status */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Статус:</span>
          {hasKey ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <IconCheck className="mr-1 size-3" />
              Ключ встановлено
            </Badge>
          ) : (
            <Badge variant="destructive">
              Ключ не налаштовано
            </Badge>
          )}
        </div>

        {/* Show masked current key */}
        {hasKey && maskedKey && (
          <div className="rounded-md border bg-muted/50 px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">Поточний ключ:</p>
            <p className="font-mono text-sm">{maskedKey}</p>
          </div>
        )}

        {/* Input for new key */}
        <div className="space-y-2">
          <label htmlFor="apiKey" className="text-sm font-medium">
            {hasKey ? "Замінити API ключ" : "Введіть API ключ"}
          </label>
          <div className="flex gap-2">
            <Input
              id="apiKey"
              type="password"
              placeholder="Вставте ваш API ключ..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono"
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
          <p className="text-xs text-muted-foreground">
            Ключ буде перевірено перед збереженням. Отримати ключ можна у{" "}
            <a
              href="https://new.novaposhta.ua"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              бізнес-кабінеті Nova Poshta
            </a>
            {" "}→ Налаштування → Безпека → Створити ключ.
          </p>
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
      </CardContent>
      {hasKey && (
        <CardFooter className="border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <IconLoader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <IconTrash className="mr-2 size-4" />
            )}
            Видалити ключ
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
