import { NextResponse } from "next/server";
import { WP_URL } from "@/lib/wp";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || body.website || !body.name || !body.email || !body.subject || String(body.message || "").trim().length < 10) return NextResponse.json({ message: "Please complete all required fields." }, { status: 400 });
  const username = process.env.WP_APPLICATION_USERNAME;
  const password = process.env.WP_APPLICATION_PASSWORD;
  if (!username || !password) return NextResponse.json({ message: "Contact service is not configured." }, { status: 503 });
  const response = await fetch(`${WP_URL}/wp-json/meraki/v1/contact`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}` }, body: JSON.stringify(body), cache: "no-store" }).catch(() => null);
  if (!response?.ok) return NextResponse.json({ message: "Email service is temporarily unavailable." }, { status: 502 });
  return NextResponse.json({ sent: true });
}
