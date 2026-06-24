'use client'

import { useEffect, useState } from "react"

interface ProfileColorExtractorProps {
  ign: string
  fallbackColor: string
  children: React.ReactNode
}

export function ProfileColorExtractor({ ign, fallbackColor, children }: ProfileColorExtractorProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [styles, setStyles] = useState<React.CSSProperties>({
    '--profile-glow': fallbackColor,
    '--profile-gradient': fallbackColor,
    '--profile-glow-text': '#ffffff',
  } as React.CSSProperties)

  useEffect(() => {
    if (!ign) {
      setIsLoaded(true);
      return;
    }

    const getColors = async () => {
      try {
        const img = new Image()
        img.crossOrigin = 'Anonymous'
        
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = `https://render.crafty.gg/2d/head/${ign}`
        })

        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(img, 0, 0)

        const getAverageRgb = (data: Uint8ClampedArray) => {
          let r = 0, g = 0, b = 0, count = 0
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) { // ignore transparent
              r += data[i]
              g += data[i + 1]
              b += data[i + 2]
              count++
            }
          }
          if (count === 0) return null
          return { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) }
        }

        // Top half (hair/hat)
        const topData = ctx.getImageData(0, 0, img.width, img.height / 2).data
        // Bottom half (face/beard)
        const bottomData = ctx.getImageData(0, img.height / 2, img.width, img.height / 2).data
        // Full image for average glow
        const fullData = ctx.getImageData(0, 0, img.width, img.height).data

        const topColor = getAverageRgb(topData)
        const bottomColor = getAverageRgb(bottomData)
        const avgColor = getAverageRgb(fullData)

        if (topColor && bottomColor && avgColor) {
          const luminance = 0.299 * avgColor.r + 0.587 * avgColor.g + 0.114 * avgColor.b;
          const isDark = luminance < 90;

          const finalGlow = isDark ? { r: 255, g: 255, b: 255 } : avgColor;
          const finalLuminance = 0.299 * finalGlow.r + 0.587 * finalGlow.g + 0.114 * finalGlow.b;
          const isFinalLight = finalLuminance > 150;

          setStyles({
            '--profile-glow': isDark ? '#ffffff' : `rgb(${avgColor.r}, ${avgColor.g}, ${avgColor.b})`,
            '--profile-gradient': `linear-gradient(to bottom right, rgb(${topColor.r}, ${topColor.g}, ${topColor.b}), rgb(${bottomColor.r}, ${bottomColor.g}, ${bottomColor.b}))`,
            '--profile-glow-text': isFinalLight ? '#000000' : '#ffffff',
          } as React.CSSProperties)
        }
      } catch (e) {
        // Silently fallback if skin extraction fails
      } finally {
        setIsLoaded(true)
      }
    }

    getColors()
  }, [ign])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const customStyles = styles as Record<string, string>;
      document.documentElement.style.setProperty('--profile-glow', customStyles['--profile-glow']);
      document.documentElement.style.setProperty('--profile-gradient', customStyles['--profile-gradient']);
      document.documentElement.style.setProperty('--profile-glow-text', customStyles['--profile-glow-text']);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        document.documentElement.style.removeProperty('--profile-glow');
        document.documentElement.style.removeProperty('--profile-gradient');
        document.documentElement.style.removeProperty('--profile-glow-text');
      }
    };
  }, [styles]);

  return (
    <div className={`w-full relative transition-opacity duration-1000 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={styles}>
      {children}
    </div>
  )
}
