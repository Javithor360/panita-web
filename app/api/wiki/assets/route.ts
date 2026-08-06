import { NextResponse } from "next/server";
import { getWikiAssets } from "@/lib/wiki";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "";
  const q = searchParams.get("q") ?? "";

  const assets = await getWikiAssets(category, q || undefined);
  return NextResponse.json({ assets });
}
