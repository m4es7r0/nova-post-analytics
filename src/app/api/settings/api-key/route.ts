import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/shared/lib/auth-guard";
import { validateApiKey } from "@/shared/api/nova-post-client";
import { sqlite } from "@/shared/lib/db";

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
  const isValid = await validateApiKey(trimmedKey);
  if (!isValid) {
    return NextResponse.json(
      { error: "Невалідний API ключ. Перевірте правильність ключа." },
      { status: 400 }
    );
  }

  // Save to user record
  try {
    sqlite
      .prepare("UPDATE user SET novaPostApiKey = ? WHERE id = ?")
      .run(trimmedKey, session.user.id);

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
    sqlite
      .prepare("UPDATE user SET novaPostApiKey = NULL WHERE id = ?")
      .run(session.user.id);

    return NextResponse.json({ success: true, message: "API ключ видалено" });
  } catch (error) {
    console.error("Failed to delete API key:", error);
    return NextResponse.json(
      { error: "Помилка видалення API ключа" },
      { status: 500 }
    );
  }
}
