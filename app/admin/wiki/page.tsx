import Link from "next/link";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getWikiArticlesForAdmin } from "@/lib/wiki";
import { Plus, Pencil, Eye, BookOpen } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin – Wiki | Panitacraft",
};

async function requireEditor() {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { trusted_author: true, roles: { select: { name: true } } },
  });
  const ok =
    user?.trusted_author ||
    user?.roles.some((r) => ["Admin", "Moderador"].includes(r.name));
  if (!ok) redirect("/wiki");
}

export default async function AdminWikiPage() {
  await requireEditor();
  const articles = await getWikiArticlesForAdmin();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-minecraft text-primary text-3xl">Gestión de Wiki</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {articles.length} {articles.length === 1 ? "artículo" : "artículos"} en total
          </p>
        </div>
        <Link
          id="admin-wiki-new-article"
          href="/wiki/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="size-4" />
          Nuevo artículo
        </Link>
      </div>

      {/* Article list */}
      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <BookOpen className="size-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">No hay artículos todavía.</p>
          <Link
            href="/wiki/new"
            className="text-primary text-sm hover:underline"
          >
            Crea el primero
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card/50">
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Título</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Categoría</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">Autor</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">Actualizado</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {articles.map((article, i) => (
                <tr
                  key={article.id}
                  className={`border-b border-border last:border-0 hover:bg-card/50 transition-colors ${
                    i % 2 === 0 ? "" : "bg-card/20"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-foreground">{article.title}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {article.category.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {article.author.ign ?? article.author.discord_name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(article.updated_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        article.is_published
                          ? "bg-green-500/15 text-green-400"
                          : "bg-yellow-500/15 text-yellow-400"
                      }`}
                    >
                      {article.is_published ? "Publicado" : "Borrador"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        id={`admin-wiki-view-${article.id}`}
                        href={`/wiki/${article.category.slug}/${article.slug}`}
                        className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                        title="Ver artículo"
                        target="_blank"
                      >
                        <Eye className="size-4" />
                      </Link>
                      <Link
                        id={`admin-wiki-edit-${article.id}`}
                        href={`/wiki/${article.category.slug}/${article.slug}?edit=true`}
                        className="p-1.5 rounded text-muted-foreground hover:text-primary transition-colors"
                        title="Editar"
                        target="_blank"
                      >
                        <Pencil className="size-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
