const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const next = require("next");
const sanitizeHtml = require("sanitize-html");

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT) || 3000;
const hostname = process.env.HOST || "0.0.0.0";
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const server = express();
const postsPath = path.join(process.cwd(), "data", "posts.json");

const programmes = new Set([
  "education",
  "health-wellbeing",
  "community-development",
  "policy-advocacy",
]);
const focusAreas = new Set([
  "education-access",
  "literacy",
  "girls-education",
  "girls-in-stem",
  "menstrual-health",
  "health-awareness",
  "community-engagement",
  "youth-skills",
  "child-wellbeing",
]);

function readPosts() {
  const contents = fs.readFileSync(postsPath, "utf8");
  const posts = JSON.parse(contents);
  if (!Array.isArray(posts)) throw new Error("The local post store must be a JSON array.");
  return posts;
}

function slugifyTitle(title) {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isAuthorized(request) {
  const expected = process.env.ADMIN_API_TOKEN;
  const supplied = request.get("x-admin-token");
  if (!expected || !supplied) return false;
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length
    && crypto.timingSafeEqual(expectedBuffer, suppliedBuffer);
}

function imageUrlIsAllowed(value) {
  if (value.startsWith("/img/") && !value.includes("..") && !value.includes("\\")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

server.use(express.json({ limit: "1mb" }));
server.get("/admin", (_request, response) => response.redirect(308, "/admin.html"));
server.post("/api/posts", (request, response) => {
  if (!isAuthorized(request)) {
    response.status(process.env.ADMIN_API_TOKEN ? 401 : 503).json({
      error: process.env.ADMIN_API_TOKEN
        ? "Admin authorization is required."
        : "Content publishing is not configured on this server.",
    });
    return;
  }

  const { title, type, program, focusArea, image, excerpt, body } = request.body ?? {};
  if (
    typeof title !== "string" || title.trim().length < 3 || title.trim().length > 120
    || !["blog", "news"].includes(type)
    || typeof program !== "string" || !programmes.has(program)
    || typeof focusArea !== "string" || !focusAreas.has(focusArea)
    || typeof image !== "string" || image.length > 2048 || !imageUrlIsAllowed(image)
    || typeof excerpt !== "string" || excerpt.trim().length < 10 || excerpt.trim().length > 240
    || typeof body !== "string" || body.trim().length < 1 || body.length > 100_000
  ) {
    response.status(400).json({ error: "Check each field and make sure the image URL is HTTPS or a local /img/ path." });
    return;
  }

  let posts;
  try {
    posts = readPosts();
  } catch (error) {
    console.error("Could not read local blog post store:", error);
    response.status(500).json({ error: "The content store could not be read." });
    return;
  }

  const publishedAt = new Date();
  const dateLabel = publishedAt.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const slugPrefix = slugifyTitle(title.trim());
  if (!slugPrefix) {
    response.status(400).json({ error: "The title must contain letters or numbers." });
    return;
  }

  const baseSlug = `${slugPrefix}-${publishedAt.getFullYear()}`;
  let slug = baseSlug;
  let suffix = 2;
  const usedSlugs = new Set(posts.map((post) => post.slug));
  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const post = {
    id: crypto.randomUUID(),
    slug,
    type,
    title: title.trim(),
    program,
    focusArea,
    image: image.trim(),
    excerpt: excerpt.trim(),
    body: sanitizeHtml(body, {
      allowedTags: [
        "p", "h2", "h3", "h4", "ul", "ol", "li", "blockquote",
        "strong", "b", "em", "i", "a", "figure", "figcaption", "img", "br",
      ],
      allowedAttributes: {
        a: ["href", "name", "target", "rel"],
        img: ["src", "alt", "width", "height"],
      },
      allowedSchemes: ["https", "mailto"],
      transformTags: {
        a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
      },
    }),
    publishedAt: publishedAt.toISOString(),
    dateLabel,
    author: "Spursbase Foundation",
  };

  try {
    fs.writeFileSync(postsPath, `${JSON.stringify([...posts, post], null, 2)}\n`, "utf8");
  } catch (error) {
    console.error("Could not save local blog post:", error);
    response.status(500).json({ error: "The story could not be saved. Please try again." });
    return;
  }

  response.status(201).json({ post: { id: post.id, slug: post.slug, dateLabel: post.dateLabel } });
});

server.use(express.static(path.join(process.cwd(), "public"), { index: false }));
server.use((request, response) => handle(request, response));
server.use((error, _request, response, _next) => {
  console.error("Request processing failed:", error);
  if (error instanceof SyntaxError) {
    response.status(400).json({ error: "The request body must contain valid JSON." });
    return;
  }
  response.status(500).json({ error: "The server could not complete the request." });
});

app.prepare().then(() => {
  server.listen(port, hostname, () => {
    console.log(`> Spursbase site ready at http://${hostname}:${port}`);
  });
}).catch((error) => {
  console.error("Could not start the Spursbase server:", error);
  process.exitCode = 1;
});
