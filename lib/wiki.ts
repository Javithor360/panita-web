import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function getWikiCategories() {
  return prisma.wikiCategory.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { articles: { where: { is_published: true } } } } },
  });
}

export async function getWikiCategoryBySlug(slug: string) {
  const category = await prisma.wikiCategory.findUnique({
    where: { slug },
  });
  if (!category) notFound();
  return category;
}

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

/** Resolve a slug OR alias to a WikiArticle */
export async function getWikiArticle(slug: string) {
  // Try primary slug first
  let article = await prisma.wikiArticle.findUnique({
    where: { slug, is_published: true },
    include: {
      category: true,
      edition: { select: { id: true, name: true, theme_color: true } },
      author: { select: { ign: true, discord_name: true, avatar_url: true } },
    },
  });

  // Fall back to alias lookup
  if (!article) {
    article = await prisma.wikiArticle.findFirst({
      where: { aliases: { has: slug }, is_published: true },
      include: {
        category: true,
        edition: { select: { id: true, name: true, theme_color: true } },
        author: { select: { ign: true, discord_name: true, avatar_url: true } },
      },
    });
  }

  if (!article) notFound();
  return article;
}

export async function getWikiArticlesByCategory(categorySlug: string) {
  return prisma.wikiArticle.findMany({
    where: {
      category: { slug: categorySlug },
      is_published: true,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      cover_url: true,
      updated_at: true,
      category: { select: { slug: true } },
      edition: { select: { name: true, theme_color: true } },
    },
    orderBy: { title: "asc" },
  });
}

// For admin – includes drafts
export async function getWikiArticlesForAdmin() {
  return prisma.wikiArticle.findMany({
    include: {
      category: { select: { name: true, slug: true } },
      author: { select: { ign: true, discord_name: true } },
    },
    orderBy: { updated_at: "desc" },
  });
}

export async function getWikiArticleForEditor(id: string) {
  const article = await prisma.wikiArticle.findUnique({
    where: { id },
    include: { category: true, edition: true },
  });
  if (!article) notFound();
  return article;
}

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------

export async function getWikiAssets(category: string, search?: string) {
  return prisma.wikiAsset.findMany({
    where: {
      category,
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    },
    orderBy: { name: "asc" },
  });
}
