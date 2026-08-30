import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { PWA_POLICY } from "../pwa-policy.mjs";
import { activePwaFixtureRevision, pwaUpdateRevisionPath } from "./pwa-update-fixture.mjs";

const port = Number(process.env.VIREO_PWA_FIXTURE_PORT ?? "4173");
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".woff2": "font/woff2",
};

function responseHeaders(pathname, file) {
  return {
    "cache-control": pathname === "/sw.js" || pathname === "/manifest.webmanifest" ? "no-cache" : "no-store",
    "content-type": mimeTypes[extname(file)] ?? "application/octet-stream",
  };
}

function requestPath(url) {
  try {
    const pathname = decodeURIComponent(new URL(url, "http://127.0.0.1").pathname);
    if (pathname.includes("\0") || pathname.split("/").includes("..")) return null;
    return pathname === "/" ? "/index.html" : pathname;
  } catch {
    return null;
  }
}

async function resolveFile(pathname) {
  const revisionRoot = pwaUpdateRevisionPath(await activePwaFixtureRevision());
  const candidate = resolve(revisionRoot, `.${pathname}`);
  if (candidate !== revisionRoot && !candidate.startsWith(`${revisionRoot}${sep}`)) return null;
  try {
    if ((await stat(candidate)).isFile()) return candidate;
  } catch {
    // History fallback below handles SPA routes only.
  }

  if (extname(pathname)) return null;
  return resolve(revisionRoot, "index.html");
}

const server = createServer(async (request, response) => {
  const pathname = request.url ? requestPath(request.url) : null;
  if (!pathname) {
    response.writeHead(400).end("Invalid request path");
    return;
  }

  try {
    if (pathname === `${PWA_POLICY.apiPathPrefix}/pwa-network-probe`) {
      response
        .writeHead(200, {
          "cache-control": "no-store",
          "content-type": "application/json; charset=utf-8",
          "x-vireo-network-probe": "passed",
        })
        .end('{"network":"passed"}');
      return;
    }
    if (pathname === PWA_POLICY.apiPathPrefix || pathname.startsWith(`${PWA_POLICY.apiPathPrefix}/`)) {
      response
        .writeHead(404, {
          "cache-control": "no-store",
          "content-type": "application/json; charset=utf-8",
        })
        .end('{"error":"not found"}');
      return;
    }
    const file = await resolveFile(pathname);
    if (!file) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.writeHead(200, responseHeaders(pathname, file));
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(503, { "content-type": "text/plain; charset=utf-8" }).end("Fixture is unavailable");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`PWA update fixture listening on http://127.0.0.1:${port}`);
});
