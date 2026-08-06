import Link from "next/link";
import { Search, ChevronDown } from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getWikiCategories } from "@/lib/wiki";

export default async function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Handle potential errors if DB is not ready
  let categories: Awaited<ReturnType<typeof getWikiCategories>> = [];
  try {
    categories = await getWikiCategories();
  } catch {
    // silently fail — wiki still renders without sidebar categories
  }

  return (
    <div
      className="min-h-screen bg-background text-foreground pt-16 relative"
      style={
        {
          "--primary": "#5FE2C5",
          "--background": "#121820",
          "--card": "#0a2b2b",
          "--border": "#134e4e",
          "--muted": "#0f3d3d",
        } as React.CSSProperties
      }
    >
      {/* Main Top Glow (Faithful to tezzlar3 but brighter) */}
      <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#5FE2C5]/20 blur-[120px] opacity-100 pointer-events-none mix-blend-screen" />

      {/* Floating Aqua Glows (Destellos para iluminar toda la página) */}
      <div className="fixed inset-0 z-0 pointer-events-none mix-blend-screen">
        <div className="absolute top-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(circle,_rgba(95,226,197,0.15)_0%,_transparent_70%)]" />
        <div className="absolute top-[20%] left-[35%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,_rgba(95,226,197,0.12)_0%,_transparent_70%)]" />
        <div className="absolute top-[55%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,_rgba(95,226,197,0.15)_0%,_transparent_70%)]" />
        <div className="absolute bottom-[10%] left-[25%] w-[35vw] h-[35vw] rounded-full bg-[radial-gradient(circle,_rgba(95,226,197,0.12)_0%,_transparent_70%)]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,_rgba(95,226,197,0.15)_0%,_transparent_70%)]" />
      </div>

      {/* 100% Pure CSS Zig-Zag Chevron Bands */}
      <div
        className="fixed inset-0 z-0 opacity-100 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(135deg, rgba(95,226,197,0.035) 25%, transparent 25%),
            linear-gradient(225deg, rgba(95,226,197,0.035) 25%, transparent 25%),
            linear-gradient(315deg, rgba(95,226,197,0.035) 25%, transparent 25%),
            linear-gradient(45deg, rgba(95,226,197,0.035) 25%, transparent 25%)
          `,
          backgroundPosition: "-20px 0, -20px 0, 0 0, 0 0",
          backgroundSize: "40px 40px",
          backgroundAttachment: "fixed",
        }}
      />

      <div className="container mx-auto px-4 max-w-[1600px] flex flex-col lg:flex-row gap-8 lg:gap-12 relative z-10">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0 mt-4 lg:mt-0">
          <div className="sticky top-24 space-y-6 flex flex-col items-center lg:items-stretch">
            {/* Logo and Search Container */}
            <div className="bg-card border border-border/50 rounded-lg p-3 flex flex-col items-center gap-3 shadow-lg w-full">
              {/* Wiki Logo (Size reduced by ~25%) */}
              <Link href="/wiki" className="block w-32 lg:w-[65%] max-w-[140px] mx-auto hover:opacity-90 transition-opacity drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]">
                <img 
                  src="/assets/wiki/wiki_logo.png" 
                  alt="Panitacraft Wiki" 
                  className="w-full h-auto object-contain"
                />
              </Link>

              {/* Search */}
              <form action="/wiki" method="GET" className="relative w-full">
                <input
                  type="text"
                  name="q"
                  placeholder="Buscar en la wiki..."
                  className="w-full bg-black/20 border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              </form>
            </div>

            {/* Portal Target for TOC */}
            <div id="wiki-sidebar-toc" className="hidden lg:block w-full" />

            {/* Desktop Categories */}
            <details className="bg-card border border-border/50 rounded-lg overflow-hidden hidden lg:block shadow-lg w-full group" open>
              <summary className="p-4 border-b border-border/50 bg-muted cursor-pointer hover:bg-muted/80 transition-colors flex justify-between items-center list-none [&::-webkit-details-marker]:hidden">
                <h3 className="font-bold text-foreground tracking-tight">
                  Descubre
                </h3>
                <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
              </summary>
              <ul className="flex flex-col p-2 gap-1 max-h-[60vh] overflow-y-auto">
                {categories.map((cat) => {
                  const Icon: LucideIcon = cat.icon
                    ? ((Icons as unknown as Record<string, LucideIcon>)[
                        cat.icon
                      ] ?? Icons.BookOpen)
                    : Icons.BookOpen;

                  return (
                    <li key={cat.slug} className="flex-shrink-0">
                      <Link
                        href={`/wiki/${cat.slug}`}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 hover:text-primary transition-colors text-sm text-muted-foreground whitespace-nowrap"
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{cat.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>



            {/* Mobile Categories horizontal scroll */}
            <div className="lg:hidden w-full overflow-x-auto pb-2 flex gap-2">
              {categories.map((cat) => {
                const Icon: LucideIcon = cat.icon
                  ? ((Icons as unknown as Record<string, LucideIcon>)[
                      cat.icon
                    ] ?? Icons.BookOpen)
                  : Icons.BookOpen;

                return (
                  <Link
                    key={cat.slug}
                    href={`/wiki/${cat.slug}`}
                    className="flex items-center space-x-2 bg-card border border-border/50 p-2 px-3 rounded-full hover:border-border transition-colors text-sm text-foreground whitespace-nowrap shadow-sm"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span>{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow min-w-0 pb-12">{children}</main>
      </div>
    </div>
  );
}
