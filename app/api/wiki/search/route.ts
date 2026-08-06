import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const articles = await prisma.wikiArticle.findMany({
    where: {
      is_published: true,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
        { aliases: { has: q.toLowerCase() } },
      ],
    },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      cover_url: true,
      category: { select: { slug: true, name: true } },
    },
    take: 10,
    orderBy: { title: "asc" },
  });

  return NextResponse.json({ results: articles });
}
