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
        img.src = `https://mc-heads.net/avatar/${ign}/256`
        
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
        })

        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(img, 0, 0)

        const getAverageColor = (data: Uint8ClampedArray) => {
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
          return `rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)})`
        }

        // Top half (hair/hat)
        const topData = ctx.getImageData(0, 0, img.width, img.height / 2).data
        // Bottom half (face/beard)
        const bottomData = ctx.getImageData(0, img.height / 2, img.width, img.height / 2).data
        // Full image for average glow
        const fullData = ctx.getImageData(0, 0, img.width, img.height).data

        const topColor = getAverageColor(topData)
        const bottomColor = getAverageColor(bottomData)
        const avgColor = getAverageColor(fullData)

        if (topColor && bottomColor && avgColor) {
          setStyles({
            '--profile-glow': avgColor,
            '--profile-gradient': `linear-gradient(to bottom right, ${topColor}, ${bottomColor})`,
          } as React.CSSProperties)
        }
      } catch (e) {
        console.error("No se pudo extraer colores de la skin", e)
      } finally {
        setIsLoaded(true)
      }
    }

    getColors()
  }, [ign])

  return (
    <div className={`w-full relative transition-opacity duration-1000 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={styles}>
      {children}
    </div>
  )
}
