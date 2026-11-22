// Band planner API: saves everything in Netlify Blobs (Netlify's built-in storage).
// Every request must carry the band code, which is set as the BAND_CODE
// environment variable in Netlify (Site configuration > Environment variables).
import { getStore } from "@netlify/blobs";
import seed from "./seed.mjs";

const COLS = ["events", "songs", "setlists", "rsvps", "away"];

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

async function ensureSeed(store) {
  if (await store.get("meta/seeded")) return;
  for (const col of COLS) {
    for (const doc of seed[col] || []) {
      await store.setJSON(`${col}/${encodeURIComponent(doc.id)}`, doc);
    }
  }
  await store.setJSON("meta/seeded", { at: new Date().toISOString() });
}

async function readAll(store) {
  const out = {};
  await Promise.all(
    COLS.map(async (col) => {
      const { blobs } = await store.list({ prefix: `${col}/` });
      const docs = await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })));
      out[col] = docs.filter(Boolean);
    }),
  );
  return out;
}

export default async (req) => {
  try {
    return await handle(req);
  } catch (err) {
    console.error(err);
    return json({ error: String((err && err.message) || err) }, 500);
  }
};

async function handle(req) {
  const code = Netlify.env.get("BAND_CODE");
  if (!code) return json({ error: "BAND_CODE is not set in Netlify" }, 500);
  if (req.headers.get("x-band-code") !== code) return json({ error: "Wrong band code" }, 401);

  // Prefer strong consistency (everyone sees changes straight away); fall back if
  // this Netlify environment doesn't offer it.
  let store = getStore({ name: "band-planner", consistency: "strong" });
  try {
    await store.get("meta/seeded");
  } catch (err) {
    console.warn("Strong consistency unavailable, using default:", err && err.message);
    store = getStore("band-planner");
  }
  const parts = new URL(req.url).pathname
    .replace(/^\/api\/?/, "")
    .split("/")
    .filter(Boolean)
    .map(decodeURIComponent);

  if (req.method === "GET" && parts[0] === "check") return json({ ok: true });

  if (req.method === "GET" && (parts.length === 0 || parts[0] === "data")) {
    await ensureSeed(store);
    return json(await readAll(store));
  }

  const [col, id] = parts;
  if (!COLS.includes(col) || !id || id.length > 200) return json({ error: "Bad request" }, 400);
  const key = `${col}/${encodeURIComponent(id)}`;

  if (req.method === "PUT") {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "Bad body" }, 400);
    if (JSON.stringify(body).length > 200000) return json({ error: "Too big" }, 413);
    await store.setJSON(key, { ...body, id });
    return json({ ok: true });
  }

  if (req.method === "DELETE") {
    await store.delete(key);
    if (col === "events") {
      // Remove everyone's "can you make it?" replies for a deleted event.
      const { blobs } = await store.list({ prefix: "rsvps/" });
      await Promise.all(
        blobs
          .filter((b) => decodeURIComponent(b.key.slice(6)).startsWith(`${id}__`))
          .map((b) => store.delete(b.key)),
      );
    }
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
}

export const config = { path: ["/api", "/api/*"] };
