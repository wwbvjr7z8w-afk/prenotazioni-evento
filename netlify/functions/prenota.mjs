import { getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Metodo non consentito" }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ error: "Richiesta non valida" }, 400); }

  // Campo trappola contro i bot: se compilato, fingiamo successo senza salvare
  if (body.website) return json({ ok: true });

  const name = String(body.name || "").trim().slice(0, 80);
  const phone = String(body.phone || "").trim().slice(0, 30);
  const seats = Math.min(10, Math.max(1, parseInt(body.seats, 10) || 1));
  if (!name) return json({ error: "Inserisci nome e cognome." }, 400);

  const id = `b-${Date.now()}-${randomUUID().slice(0, 8)}`;
  const booking = { id, name, phone, seats, source: "online", createdAt: new Date().toISOString() };
  await getStore({ name: "prenotazioni", consistency: "strong" }).setJSON(id, booking);
  return json({ ok: true, booking });
};

export const config = { path: "/api/prenota" };
