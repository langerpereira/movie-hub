import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { id } = params
  const apiKey = process.env.TMDB_API_KEY

  if (!apiKey || apiKey === 'YOUR_TMDB_API_KEY_HERE') {
    return NextResponse.json({
      error: 'TMDB API key not configured',
      results: []
    })
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${id}&sort_by=popularity.desc`,
      { next: { revalidate: 3600 } }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch movies by genre')
    }

    const data = await response.json()
    return NextResponse.json({ results: data.results || [] })
  } catch (error) {
    console.error('Genre movies API error:', error)
    return NextResponse.json({ error: error.message, results: [] })
  }
}
