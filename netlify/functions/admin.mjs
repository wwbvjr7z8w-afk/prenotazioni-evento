import { getStore } from "@netlify/blobs";
import { scryptSync, randomBytes, timingSafeEqual, randomUUID } from "node:crypto";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const settings = () => getStore({ name: "impostazioni", consistency: "strong" });
const bookings = () => getStore({ name: "prenotazioni", consistency: "strong" });

async function checkPassword(password) {
  const s = await settings().get("admin", { type: "json" });
  if (!s) return false;
  const candidate = scryptSync(String(password || ""), Buffer.from(s.salt, "hex"), 64);
  const stored = Buffer.from(s.hash, "hex");
  return candidate.length === stored.length && timingSafeEqual(candidate, stored);
}

export default async (req) => {
  if (req.method === "GET") {
    const s = await settings().get("admin", { type: "json" });
    return json({ configured: Boolean(s) });
  }
  if (req.method !== "POST") return json({ error: "Metodo non consentito" }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Richiesta non valida" }, 400); }
  const action = body.action;

  // Primo accesso: imposta la password (possibile una sola volta)
  if (action === "setup") {
    if (await settings().get("admin", { type: "json" })) {
      return json({ error: "La password è già stata impostata." }, 409);
    }
    const password = String(body.password || "");
    if (password.length < 6) return json({ error: "La password deve avere almeno 6 caratteri." }, 400);
    const salt = randomBytes(16);
    const hash = scryptSync(password, salt, 64);
    await settings().setJSON("admin", {
      salt: salt.toString("hex"),
      hash: hash.toString("hex"),
      createdAt: new Date().toISOString(),
    });
    return json({ ok: true });
  }

  if (!(await checkPassword(body.password))) {
    await new Promise((r) => setTimeout(r, 700));
    return json({ error: "Password errata." }, 401);
  }

  const store = bookings();

  if (action === "login") return json({ ok: true });

  if (action === "list") {
    const { blobs } = await store.list();
    const items = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean);
    items.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
    return json({ ok: true, items });
  }

  if (action === "delete") {
    const id = String(body.id || "");
    if (!/^[bm]-[\w-]+$/.test(id)) return json({ error: "Prenotazione non valida." }, 400);
    await store.delete(id);
    return json({ ok: true });
  }

  if (action === "add") {
    const name = String(body.name || "").trim().slice(0, 80);
    const phone = String(body.phone || "").trim().slice(0, 30);
    const seats = Math.min(20, Math.max(1, parseInt(body.seats, 10) || 1));
    if (!name) return json({ error: "Inserisci almeno il nome." }, 400);
    const id = `m-${Date.now()}-${randomUUID().slice(0, 8)}`;
    const booking = { id, name, phone, seats, source: "manuale", createdAt: new Date().toISOString() };
    await store.setJSON(id, booking);
    return json({ ok: true, booking });
  }

  return json({ error: "Azione sconosciuta." }, 400);
};

export const config = { path: "/api/admin" };
