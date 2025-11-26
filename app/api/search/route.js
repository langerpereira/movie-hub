/* FILE: app/api/search/route.js */
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  // Check if TMDB API key is configured
  const apiKey = process.env.TMDB_API_KEY

  if (!apiKey || apiKey === 'YOUR_TMDB_API_KEY_HERE') {
    return NextResponse.json({
      error: 'TMDB API key not configured',
      results: []
    })
  }

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=1`,
      { next: { revalidate: 3600 } }
    )

    if (!response.ok) {
      throw new Error('TMDB API error')
    }

    const data = await response.json()
    
    // Filter to only movies and TV shows
    const filtered = data.results.filter(
      item => item.media_type === 'movie' || item.media_type === 'tv'
    )

    return NextResponse.json({ results: filtered })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: error.message, results: [] })
  }
}
