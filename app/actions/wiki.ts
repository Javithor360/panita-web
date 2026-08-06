"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

async function requireWikiEditor() {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, trusted_author: true, roles: { select: { name: true } } },
  });
  const isMod =
    user?.trusted_author ||
    user?.roles.some((r) => ["Admin", "Moderador"].includes(r.name));
  if (!isMod) redirect("/wiki");
  return user!;
}

// ---------------------------------------------------------------------------
// Article mutations
// ---------------------------------------------------------------------------

export async function createWikiArticle(formData: FormData) {
  const user = await requireWikiEditor();

  const slug = String(formData.get("slug")).trim();
  const title = String(formData.get("title")).trim();
  const categoryId = String(formData.get("category_id"));
  const editionId = formData.get("edition_id") as string | null;
  const excerpt = formData.get("excerpt") as string | null;
  const coverUrl = formData.get("cover_url") as string | null;
  const content = JSON.parse(String(formData.get("content")));
  const infoboxData = formData.has("infobox_data") ? JSON.parse(String(formData.get("infobox_data"))) : null;
  const aliases = JSON.parse(String(formData.get("aliases") || "[]")) as string[];
  const isPublished = formData.get("is_published") === "true";

  await prisma.wikiArticle.create({
    data: {
      slug,
      title,
      content,
      category: { connect: { id: categoryId } },
      edition: editionId ? { connect: { id: editionId } } : undefined,
      excerpt: excerpt || null,
      cover_url: coverUrl || null,
      infobox_data: infoboxData,
      author: { connect: { id: user.id } },
      aliases,
      is_published: isPublished,
    },
  });

  revalidatePath("/wiki");
  revalidatePath(`/wiki/${slug}`);
  return { slug, success: true };
}

export async function updateWikiArticle(id: string, formData: FormData) {
  await requireWikiEditor();

  const slug = String(formData.get("slug")).trim();
  const title = String(formData.get("title")).trim();
  const categoryId = String(formData.get("category_id"));
  const editionId = formData.get("edition_id") as string | null;
  const excerpt = formData.get("excerpt") as string | null;
  const coverUrl = formData.get("cover_url") as string | null;
  const content = JSON.parse(String(formData.get("content")));
  const infoboxData = formData.has("infobox_data") ? JSON.parse(String(formData.get("infobox_data"))) : null;
  const aliases = JSON.parse(String(formData.get("aliases") || "[]")) as string[];
  const isPublished = formData.get("is_published") === "true";

  const article = await prisma.wikiArticle.update({
    where: { id },
    data: {
      slug,
      title,
      content,
      category: { connect: { id: categoryId } },
      edition: editionId ? { connect: { id: editionId } } : { disconnect: true },
      excerpt: excerpt || null,
      cover_url: coverUrl || null,
      infobox_data: infoboxData,
      aliases,
      is_published: isPublished,
    },
    include: {
      category: true,
    }
  });

  revalidatePath("/wiki");
  revalidatePath(`/wiki/${article.category.slug}/${article.slug}`);
  return { slug: article.slug, categorySlug: article.category.slug, success: true };
}

export async function deleteWikiArticle(id: string) {
  await requireWikiEditor();
  const article = await prisma.wikiArticle.delete({
    where: { id },
    include: { category: true },
  });
  revalidatePath("/wiki");
  revalidatePath(`/wiki/${article.category.slug}`);
  revalidatePath(`/wiki/${article.category.slug}/${article.slug}`);
  redirect(`/wiki/${article.category.slug}`);
}

// ---------------------------------------------------------------------------
// Asset upload (Cloudinary + DB record)
// ---------------------------------------------------------------------------

export async function uploadWikiAsset(formData: FormData) {
  await requireWikiEditor();

  const file = formData.get("file") as File;
  const category = String(formData.get("category")).toLowerCase().trim();
  const name = String(formData.get("name")).toLowerCase().trim().replace(/\.[^/.]+$/, ""); // strip extension

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: `panita-web/wiki/${category}`,
        public_id: name,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) reject(error);
        else resolve(result as { secure_url: string });
      }
    ).end(buffer);
  });

  // Upsert so re-uploads update the URL
  const asset = await prisma.wikiAsset.upsert({
    where: { category_name: { category, name } },
    update: { url: result.secure_url },
    create: { name, url: result.secure_url, category },
  });

  return asset;
}

export async function cloneWikiArticle(id: string) {
  await requireWikiEditor();
  const article = await prisma.wikiArticle.findUnique({
    where: { id },
    include: { category: true }
  });
  if (!article) throw new Error("Article not found");
  
  const newSlug = `${article.slug}-copy-${Date.now().toString().slice(-4)}`;
  
  await prisma.wikiArticle.create({
    data: {
      title: `${article.title} (Copia)`,
      slug: newSlug,
      excerpt: article.excerpt,
      content: article.content as any,
      cover_url: article.cover_url,
      infobox_data: article.infobox_data as any,
      aliases: article.aliases as any,
      is_published: false,
      category: { connect: { id: article.category_id } },
      edition: article.edition_id ? { connect: { id: article.edition_id } } : undefined,
      author: { connect: { id: article.author_id } },
    }
  });

  revalidatePath("/wiki");
  revalidatePath(`/wiki/${article.category.slug}`);
  redirect(`/wiki/${article.category.slug}/${newSlug}?edit=true`);
}
