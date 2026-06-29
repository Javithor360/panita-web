"use client";

import { useEffect, useState } from "react";

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [targetInfo, setTargetInfo] = useState({ title: "", targetDate: -1 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const calculateTarget = () => {
      const now = new Date();
      // July 1, 2026 20:00 UTC-6 = July 2, 2026 02:00:00 UTC
      const inauguration = Date.UTC(2026, 6, 2, 2, 0, 0); 
      
      const currentUTC = now.getTime();
      
      if (currentUTC < inauguration) {
        return {
          title: "Inauguración de Tezzlar III",
          targetDate: inauguration
        };
      } else {
        // Find current time in UTC-6
        const currentUTC6Time = currentUTC - (6 * 60 * 60 * 1000);
        const d = new Date(currentUTC6Time);
        
        const year = d.getUTCFullYear();
        const month = d.getUTCMonth();
        const date = d.getUTCDate();
        const hours = d.getUTCHours();
        
        // If event is over (August or beyond, or after last day's timer)
        if (month > 6 || (month === 6 && date === 31 && hours >= 14)) {
          return { title: "¡Tezzlar III ha concluido!", targetDate: 0 };
        }
        
        let nextTargetDate = date;
        let dayN = date; 
        
        // After 14:00 UTC-6, the target shifts to the next day
        if (hours >= 14) {
          nextTargetDate += 1;
          dayN += 1;
        }
        
        // Target time is 14:00 UTC-6, which is 20:00 UTC
        const targetUTC = Date.UTC(year, month, nextTargetDate, 20, 0, 0);
        
        return {
          title: `Tezzlar - Día ${dayN}`,
          targetDate: targetUTC
        };
      }
    };

    const updateTimer = () => {
      const info = calculateTarget();
      setTargetInfo(info);
      
      if (info.targetDate === 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const difference = info.targetDate - new Date().getTime();
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isMounted || targetInfo.targetDate === -1) return null;

  return (
    <div className="relative flex flex-col items-center justify-center my-6 p-6 sm:p-8 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-white/20 hover:shadow-[0_0_40px_-10px_rgba(139,49,34,0.3)] select-none animate-in fade-in zoom-in duration-700 overflow-hidden group">
      
      {/* Subtle glow effect inside the box */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#8b3122]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#5FE2C5] via-[#C6DEF1] to-[#5FE2C5] text-transparent bg-clip-text mb-6 drop-shadow-[0_2px_4px_#0D1E40] tracking-wide">
        {targetInfo.title}
      </h3>
      
      {targetInfo.targetDate !== 0 ? (
        <div className="flex gap-3 sm:gap-5">
          {[
            { label: "DÍAS", value: timeLeft.days },
            { label: "HORAS", value: timeLeft.hours },
            { label: "MINUTOS", value: timeLeft.minutes },
            { label: "SEGUNDOS", value: timeLeft.seconds }
          ].map((item, index) => (
            <div key={item.label} className="flex flex-col items-center">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl border border-white/20 bg-black/40 backdrop-blur-md shadow-[0_8px_32px_0_rgba(255,255,255,0.05)] transition-all duration-1000 ease-in-out group-hover:bg-black/60 group-hover:border-[#FDE047]/40 group-hover:shadow-[inset_0_0_20px_rgba(234,179,8,0.2)]">
                <span className="text-2xl sm:text-4xl font-bold tabular-nums tracking-tighter inline-block transform-gpu bg-gradient-to-b from-white to-white/50 group-hover:from-[#FDE047] group-hover:to-[#D97706] text-transparent bg-clip-text drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_30px_rgba(234,179,8,0.8)] transition-all duration-1000 ease-in-out group-hover:scale-110">
                  {item.value.toString().padStart(2, '0')}
                </span>
              </div>
              <span className="mt-3 text-[10px] sm:text-xs font-semibold tracking-widest text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-zinc-400 font-medium">Gracias por participar en esta edición.</div>
      )}
    </div>
  );
}
