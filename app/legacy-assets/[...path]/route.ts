import { readFile } from "node:fs/promises";
import path from "node:path";
import { rewriteLegacyCssImages } from "@/lib/legacy-assets";

const imageTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
};

type RouteProps = { params: Promise<{ path: string[] }> };

export async function GET(_request: Request, { params }: RouteProps) {
  const { path: segments } = await params;
  if (segments.some((segment) => !segment || segment === "." || segment === ".." || segment.includes("/") || segment.includes("\\"))) {
    return new Response("Not found", { status: 404 });
  }

  const assetType = segments[0];
  let filePath: string;
  let contentType: string;

  if (assetType === "img" && segments.length > 1) {
    const extension = path.extname(segments.at(-1) ?? "").toLowerCase();
    contentType = imageTypes[extension] ?? "";
    if (!contentType) return new Response("Unsupported image type", { status: 415 });

    const imageRoot = path.resolve(process.cwd(), "img");
    filePath = path.resolve(imageRoot, ...segments.slice(1));
    if (!filePath.startsWith(`${imageRoot}${path.sep}`)) return new Response("Not found", { status: 404 });
  } else if (assetType === "css" && segments.length === 2 && /^[\w.-]+\.css$/i.test(segments[1])) {
    contentType = "text/css; charset=utf-8";
    if (segments[1] === "style.css") {
      filePath = path.resolve(process.cwd(), "pages", "style.css");
    } else {
      const legacyCssRoot = path.resolve(process.cwd(), "pages", "css", "css");
      const fallbackCssRoot = path.resolve(process.cwd(), "css", "css");
      filePath = path.join(legacyCssRoot, segments[1]);
      try {
        await readFile(filePath);
      } catch {
        filePath = path.join(fallbackCssRoot, segments[1]);
      }
    }
  } else if (assetType === "documents" && segments.length > 1 && /\.pdf$/i.test(segments.at(-1) ?? "")) {
    contentType = "application/pdf";
    const documentsRoot = path.resolve(process.cwd(), "pages", "documents");
    filePath = path.resolve(documentsRoot, ...segments.slice(1));
    if (!filePath.startsWith(`${documentsRoot}${path.sep}`)) return new Response("Not found", { status: 404 });
  } else if (assetType === "js" && segments.length === 2 && segments[1] === "main.js") {
    contentType = "text/javascript; charset=utf-8";
    filePath = path.resolve(process.cwd(), "js", "main.js");
  } else {
    return new Response("Not found", { status: 404 });
  }

  try {
    const asset = await readFile(filePath);
    const body = assetType === "css" ? rewriteLegacyCssImages(asset.toString("utf8")) : asset;
    const cacheControl = assetType === "css" || assetType === "js"
      ? "public, max-age=0, must-revalidate"
      : "public, max-age=86400, s-maxage=31536000, immutable";
    return new Response(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": cacheControl,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}