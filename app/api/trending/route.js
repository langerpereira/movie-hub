import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY

  if (!apiKey || apiKey === 'YOUR_TMDB_API_KEY_HERE') {
    return NextResponse.json({
      error: 'TMDB API key not configured',
      results: []
    })
  }

  try {
    // Fetch trending movies and TV shows
    const [trendingMovies, trendingTV, popularMovies, topRated] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`, {
        next: { revalidate: 3600 }
      }),
      fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}`, {
        next: { revalidate: 3600 }
      }),
      fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`, {
        next: { revalidate: 3600 }
      }),
      fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}`, {
        next: { revalidate: 3600 }
      })
    ])

    const data = await Promise.all([
      trendingMovies.json(),
      trendingTV.json(),
      popularMovies.json(),
      topRated.json()
    ])

    return NextResponse.json({
      trendingMovies: data[0].results || [],
      trendingTV: data[1].results || [],
      popularMovies: data[2].results || [],
      topRated: data[3].results || []
    })
  } catch (error) {
    console.error('Trending API error:', error)
    return NextResponse.json({
      error: error.message,
      trendingMovies: [],
      trendingTV: [],
      popularMovies: [],
      topRated: []
    })
  }
}
