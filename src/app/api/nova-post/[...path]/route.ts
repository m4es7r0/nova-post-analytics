import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/shared/lib/auth-guard";
import { getNovaPostClient } from "@/shared/api/nova-post-client";

/**
 * Authenticated proxy to Nova Post API.
 * Validates user session via better-auth, then forwards the request
 * using the user's personal API key.
 */

function getUserApiKey(session: { user: Record<string, unknown> }): string | null {
  return (session.user.novaPostApiKey as string | null | undefined) || null;
}

const NO_KEY_RESPONSE = NextResponse.json(
  { error: "API ключ не налаштовано. Перейдіть у налаштування." },
  { status: 400 }
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = getUserApiKey(session as unknown as { user: Record<string, unknown> });
  if (!apiKey) return NO_KEY_RESPONSE;

  const { path } = await params;
  const endpoint = `/${path.join("/")}`;

  const queryParams: Record<string, string | string[]> = {};
  for (const [key, value] of request.nextUrl.searchParams) {
    if (key.endsWith("[]")) {
      const cleanKey = key.replace("[]", "");
      if (!queryParams[cleanKey]) queryParams[cleanKey] = [];
      (queryParams[cleanKey] as string[]).push(value);
    } else {
      queryParams[key] = value;
    }
  }

  const client = getNovaPostClient(apiKey);
  const result = await client.get(endpoint, queryParams);

  if (!result.success) {
    return NextResponse.json(result.error, { status: result.error.status });
  }

  return NextResponse.json(result.data);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = getUserApiKey(session as unknown as { user: Record<string, unknown> });
  if (!apiKey) return NO_KEY_RESPONSE;

  const { path } = await params;
  const endpoint = `/${path.join("/")}`;
  const body = await request.json();

  const client = getNovaPostClient(apiKey);
  const result = await client.post(endpoint, body);

  if (!result.success) {
    return NextResponse.json(result.error, { status: result.error.status });
  }

  return NextResponse.json(result.data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = getUserApiKey(session as unknown as { user: Record<string, unknown> });
  if (!apiKey) return NO_KEY_RESPONSE;

  const { path } = await params;
  const endpoint = `/${path.join("/")}`;
  const body = await request.json();

  const client = getNovaPostClient(apiKey);
  const result = await client.put(endpoint, body);

  if (!result.success) {
    return NextResponse.json(result.error, { status: result.error.status });
  }

  return NextResponse.json(result.data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = getUserApiKey(session as unknown as { user: Record<string, unknown> });
  if (!apiKey) return NO_KEY_RESPONSE;

  const { path } = await params;
  const endpoint = `/${path.join("/")}`;

  let body: unknown = undefined;
  try {
    body = await request.json();
  } catch {
    // No body is fine for DELETE
  }

  const client = getNovaPostClient(apiKey);
  const result = await client.delete(endpoint, body);

  if (!result.success) {
    return NextResponse.json(result.error, { status: result.error.status });
  }

  return NextResponse.json(result.data);
}
