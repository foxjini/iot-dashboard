import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const deviceCode = url.searchParams.get("device_code"); // 예: RPI5-01

  if (!deviceCode) {
    return NextResponse.json({ error: "device_code is required" }, { status: 400 });
  }

  // device_code -> device_id 조회
  const { data: device, error: dErr } = await supabaseAdmin
    .from("devices")
    .select("id")
    .eq("device_code", deviceCode)
    .single();

  if (dErr || !device) {
    return NextResponse.json({ error: "Unknown device_code" }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from("readings")
    .select("id, ts, metrics, device_id")
    .eq("device_id", device.id)
    .order("ts", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] }, { status: 200 });
}
