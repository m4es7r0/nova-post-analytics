import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/shared/lib/auth-guard";
import { validateApiKey } from "@/shared/api/nova-post-client";
import { pool } from "@/shared/lib/db";

/**
 * PUT /api/settings/api-key
 * Save the user's personal Nova Post API key.
 * Validates the key against the Nova Post API before saving.
 */
export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { apiKey } = body as { apiKey?: string };

  if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
    return NextResponse.json(
      { error: "API ключ не може бути порожнім" },
      { status: 400 }
    );
  }

  const trimmedKey = apiKey.trim();

  // Validate against Nova Post API
  const validation = await validateApiKey(trimmedKey);
  if (!validation.isValid) {
    if (validation.reason === "expired") {
      return NextResponse.json(
        {
          error:
            "Термін дії API ключа Nova Post закінчився. Створіть новий ключ у бізнес-кабінеті та збережіть його тут.",
        },
        { status: 422 }
      );
    }

    if (validation.reason === "rate_limited") {
      return NextResponse.json(
        {
          error:
            "Nova Post тимчасово обмежила кількість запитів. Спробуйте ще раз через 1-2 хвилини.",
        },
        { status: 429 }
      );
    }

    if (validation.reason === "unavailable") {
      return NextResponse.json(
        {
          error:
            "Сервіс Nova Post тимчасово недоступний. Спробуйте зберегти ключ пізніше.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Невалідний API ключ. Перевірте правильність ключа." },
      { status: 400 }
    );
  }

  // Save to user record
  try {
    await pool.query(
      'UPDATE "user" SET "novaPostApiKey" = $1 WHERE "id" = $2',
      [trimmedKey, session.user.id]
    );

    return NextResponse.json({ success: true, message: "API ключ збережено" });
  } catch (error) {
    console.error("Failed to save API key:", error);
    return NextResponse.json(
      { error: "Помилка збереження API ключа" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/settings/api-key
 * Remove the user's personal Nova Post API key.
 */
export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await pool.query(
      'UPDATE "user" SET "novaPostApiKey" = NULL WHERE "id" = $1',
      [session.user.id]
    );

    return NextResponse.json({ success: true, message: "API ключ видалено" });
  } catch (error) {
    console.error("Failed to delete API key:", error);
    return NextResponse.json(
      { error: "Помилка видалення API ключа" },
      { status: 500 }
    );
  }
}
