import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type IngestPayload = {
  device_code: string;
  token: string;
  ts?: string;
  metrics: Record<string, number | string | boolean | null>;
};

function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as IngestPayload | null;

  if (!body?.device_code || !body?.token || !body?.metrics) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data: device } = await supabaseAdmin
    .from("devices")
    .select("id, token_hash")
    .eq("device_code", body.device_code)
    .single();

  if (!device || sha256(body.token) !== device.token_hash) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ts = body.ts ? new Date(body.ts).toISOString() : new Date().toISOString();

  const { data: reading, error: rErr } = await supabaseAdmin
    .from("readings")
    .insert({ device_id: device.id, ts, metrics: body.metrics })
    .select("id")
    .single();

  if (rErr || !reading) {
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, reading_id: reading.id }, { status: 200 });
}
