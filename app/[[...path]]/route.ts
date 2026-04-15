import { type NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

const NOT_FOUND_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Página no encontrada</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, sans-serif;
      background: #f8f9fa;
      color: #343a40;
      text-align: center;
      padding: 2rem;
    }
    h1 { font-size: 6rem; font-weight: 800; color: #dee2e6; line-height: 1; }
    p  { font-size: 1.125rem; color: #6c757d; margin-top: 1rem; }
  </style>
</head>
<body>
  <h1>404</h1>
  <p>Esta página no existe o todavía no ha sido publicada.</p>
</body>
</html>`;

export async function GET(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const hostWithoutPort = host.split(":")[0];
  const parts = hostWithoutPort.split(".");

  // Need at least subdomain.domain.tld  (3 parts)
  if (parts.length < 3) {
    return new NextResponse(NOT_FOUND_HTML, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const slug = parts[0];
  const domain = parts.slice(1).join(".");

  const row = await queryOne<{ html: string }>(
    `SELECT html FROM landings
     WHERE slug = $1 AND domain = $2 AND status = 'published'`,
    [slug, domain]
  );

  if (!row?.html) {
    return new NextResponse(NOT_FOUND_HTML, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return new NextResponse(row.html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
