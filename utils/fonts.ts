'use client'

import { useEffect } from 'react'

/**
 * Loads a Google Font and returns the CSS font-family string.
 */
export function useGoogleFont(fontName: string): string {
  useEffect(() => {
    const id = `google-font-${fontName.replace(/\s+/g, '-').toLowerCase()}`
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700;800&display=swap`
    document.head.appendChild(link)
  }, [fontName])

  return `'${fontName}', sans-serif`
}
