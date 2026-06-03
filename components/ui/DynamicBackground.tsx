export function DynamicBackground({ color, spacing = 32, position = "fixed" }: { color?: string, spacing?: number, position?: "fixed" | "absolute" }) {
  const primaryColor = color || 'var(--primary)';
  
  return (
    <div className={`${position} inset-0 z-0 pointer-events-none bg-[#050505] overflow-hidden`}>
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--foreground) 1px, transparent 1px),
            linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)
          `,
          backgroundSize: `${spacing}px ${spacing}px`
        }}
      />
      {/* Glow Top Left */}
      <div 
        className="absolute -top-[10%] -left-[10%] w-[70%] h-[70%] rounded-full opacity-[0.12] blur-[120px]"
        style={{ backgroundColor: primaryColor }}
      />
      {/* Glow Bottom Right */}
      <div 
        className="absolute -bottom-[10%] -right-[10%] w-[70%] h-[70%] rounded-full opacity-[0.12] blur-[120px]"
        style={{ backgroundColor: primaryColor }}
      />
    </div>
  );
}
