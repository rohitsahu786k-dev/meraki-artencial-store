import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request) {
  return handleRevalidation(request);
}

export async function GET(request) {
  return handleRevalidation(request);
}

async function handleRevalidation(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const path = searchParams.get("path") || "/";

  const expectedSecret = process.env.REVALIDATION_SECRET || "meraki_headless_reval_sec_2026";

  if (!secret || secret !== expectedSecret) {
    return NextResponse.json(
      { revalidated: false, message: "Invalid or missing revalidation secret" },
      { status: 401 }
    );
  }

  try {
    if (path === "all" || path === "/") {
      revalidatePath("/", "layout");
    } else {
      revalidatePath(path);
    }

    return NextResponse.json({
      revalidated: true,
      path,
      timestamp: Date.now(),
      message: `Path ${path} successfully revalidated.`,
    });
  } catch (error) {
    return NextResponse.json(
      { revalidated: false, message: error.message || "Revalidation failed" },
      { status: 500 }
    );
  }
}
