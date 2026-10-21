import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { decodeHTML } from "entities";

const legacyRoot = path.join(process.cwd(), "pages");

export type LegacyRoute = { slug: string[] };
export type LegacyPage = {
  route: string[];
  title: string;
  description?: string;
  html: string;
  stylesheets: string[];
};

function getStylesheets(html: string) {
  const stylesheets = new Set<string>();
  for (const match of html.matchAll(/<link\b([^>]*)>/gi)) {
    const attributes = match[1];
    const rel = attributes.match(/\brel=["']([^"']+)["']/i)?.[1];
    const href = attributes.match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (!href || !rel?.split(/\s+/).some((value) => value.toLowerCase() === "stylesheet")) continue;

    if (/^https:\/\/cdnjs\.cloudflare\.com\//i.test(href)) {
      stylesheets.add(href);
      continue;
    }

    const filename = href.match(/(?:^|\/)css\/css\/([^/?#]+\.css)(?:[?#]|$)/i)?.[1];
    if (filename) {
      stylesheets.add(`/legacy-assets/css/${encodeURIComponent(filename)}?v=20261019-6`);
      continue;
    }

    if (/^(?:\.\/)?style\.css(?:[?#]|$)/i.test(href)) {
      stylesheets.add(`/legacy-assets/css/style.css?v=20261019-6`);
    }
  }
  return [...stylesheets];
}

function slugSegment(value: string) {
  return decodeURIComponent(value)
    .replace(/\.html$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function walkHtmlFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkHtmlFiles(absolutePath);
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
      const html = await readFile(absolutePath, "utf8");
      const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;
      const meaningfulText = body
        .replace(/<!--[\s\S]*?-->/g, " ")
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;|&#160;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
      return meaningfulText.length >= 40 ? [absolutePath] : [];
    }
    return [];
  }));
  return nested.flat();
}

async function getPageFiles(includeBlog = false) {
  const files = await walkHtmlFiles(legacyRoot);
  return files.flatMap((filePath) => {
    const relativePath = path.relative(legacyRoot, filePath).split(path.sep).join("/");
    const route = relativePath.split("/").map(slugSegment);
    const routeKey = route.join("/");
    if (!routeKey || routeKey === "index" || routeKey === "404" || routeKey === "r4c-sticker" || routeKey === "library" || routeKey === "our-mission" || routeKey === "our-vision" || (!includeBlog && routeKey === "blog")) return [];
    return [{ filePath, route, routeKey }];
  });
}

export async function getLegacyRoutes(): Promise<LegacyRoute[]> {
  const pages = await getPageFiles();
  return pages.map(({ route }) => ({ slug: route }));
}

export async function getLegacyPage(slug: string[], options: { includeBlog?: boolean } = {}): Promise<LegacyPage | null> {
  const route = slug.map(slugSegment);
  const routeKey = route.join("/");
  const page = (await getPageFiles(options.includeBlog)).find((entry) => entry.routeKey === routeKey);
  if (!page) return null;

  const html = await readFile(page.filePath, "utf8");
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, "").trim();
  const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1];
  return {
    route: page.route,
    title: title ? decodeHTML(title) : page.route.at(-1)?.replace(/-/g, " ") || "Spursbase Foundation",
    description: description ? decodeHTML(description) : undefined,
    html,
    stylesheets: getStylesheets(html),
  };
}

export async function getLegacyHomepage(): Promise<LegacyPage> {
  const html = await readFile(path.join(process.cwd(), "index.html"), "utf8");
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, "").trim();
  const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1];
  return {
    route: [],
    title: title ? decodeHTML(title) : "Spursbase Foundation",
    description: description ? decodeHTML(description) : undefined,
    html,
    stylesheets: getStylesheets(html),
  };
}