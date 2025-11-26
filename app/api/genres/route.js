import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY

  if (!apiKey || apiKey === 'YOUR_TMDB_API_KEY_HERE') {
    return NextResponse.json({
      error: 'TMDB API key not configured',
      genres: []
    })
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    )

    if (!response.ok) {
      throw new Error('Failed to fetch genres')
    }

    const data = await response.json()
    return NextResponse.json({ genres: data.genres || [] })
  } catch (error) {
    console.error('Genres API error:', error)
    return NextResponse.json({ error: error.message, genres: [] })
  }
}
