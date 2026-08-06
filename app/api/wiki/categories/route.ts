import { NextResponse } from "next/server";
import { getWikiCategories } from "@/lib/wiki";

export async function GET() {
  const categories = await getWikiCategories();
  return NextResponse.json({ categories });
}
