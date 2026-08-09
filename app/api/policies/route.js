import { NextResponse } from "next/server";
import { getPolicyPages } from "@/lib/wp-storefront";

export async function GET() {
  const policies = await getPolicyPages().catch(() => []);
  return NextResponse.json({ policies }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
