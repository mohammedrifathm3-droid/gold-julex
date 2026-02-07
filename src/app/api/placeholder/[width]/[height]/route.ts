import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ width: string, height: string }> }
) {
  const { width, height } = await params
  const w = parseInt(width)
  const h = parseInt(height)
  
  // Create a simple PNG placeholder using a data URL
  const canvas = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="${Math.min(w, h) / 10}" fill="#9ca3af">
        ${w} × ${h}
      </text>
    </svg>
  `
  
  return new NextResponse(canvas, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400', // Cache for 1 day
    },
  })
}