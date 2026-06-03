export function DynamicBackground({ color, spacing = 32, position = "fixed" }: { color?: string, spacing?: number, position?: "fixed" | "absolute" }) {
  const primaryColor = color || 'var(--primary)';
  
  return (
    <div className={`${position} inset-0 z-0 pointer-events-none bg-[#050505] overflow-hidden`}>
      {/* Cross Pattern (+) */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='${spacing}' height='${spacing}' viewBox='0 0 ${spacing} ${spacing}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M${spacing/2} ${spacing/2 - 4}v8M${spacing/2 - 4} ${spacing/2}h8' stroke='rgba(255,255,255,0.12)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
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
