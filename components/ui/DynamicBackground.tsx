export function DynamicBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-[oklch(0.14_0_0)]"
         style={{
           backgroundImage: `
             radial-gradient(ellipse 60% 60% at 20% 0%, color-mix(in oklab, var(--primary) 12%, transparent), transparent),
             radial-gradient(ellipse 60% 60% at 80% 100%, color-mix(in oklab, var(--primary) 12%, transparent), transparent),
             linear-gradient(to right, color-mix(in oklab, var(--foreground) 3%, transparent) 1px, transparent 1px),
             linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 3%, transparent) 1px, transparent 1px)
           `,
           backgroundSize: '100% 100%, 100% 100%, 32px 32px, 32px 32px'
         }}
    />
  );
}
