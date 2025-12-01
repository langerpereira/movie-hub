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
    // Fetch multiple categories in parallel
    const [
      trendingMovies,
      trendingTV,
      popularMovies,
      topRated,
      actionMovies,
      comedyMovies,
      horrorMovies,
      animationMovies,
      documentaries,
      kidsMovies
    ] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`, { next: { revalidate: 14400 } }),
      fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}`, { next: { revalidate: 14400 } }),
      fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`, { next: { revalidate: 14400 } }),
      fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}`, { next: { revalidate: 14400 } }),
      fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=28&sort_by=popularity.desc`, { next: { revalidate: 14400 } }),
      fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=35&sort_by=popularity.desc`, { next: { revalidate: 14400 } }),
      fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=27&sort_by=popularity.desc`, { next: { revalidate: 14400 } }),
      fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=16&sort_by=popularity.desc`, { next: { revalidate: 14400 } }),
      fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=99&sort_by=popularity.desc`, { next: { revalidate: 14400 } }),
      fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=10751&sort_by=popularity.desc`, { next: { revalidate: 14400 } })
    ])

    const data = await Promise.all([
      trendingMovies.json(),
      trendingTV.json(),
      popularMovies.json(),
      topRated.json(),
      actionMovies.json(),
      comedyMovies.json(),
      horrorMovies.json(),
      animationMovies.json(),
      documentaries.json(),
      kidsMovies.json()
    ])

    return NextResponse.json({
      trendingMovies: data[0].results || [],
      trendingTV: data[1].results || [],
      popularMovies: data[2].results || [],
      topRated: data[3].results || [],
      actionMovies: data[4].results || [],
      comedyMovies: data[5].results || [],
      horrorMovies: data[6].results || [],
      animationMovies: data[7].results || [],
      documentaries: data[8].results || [],
      kidsMovies: data[9].results || []
    })
  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json({
      error: error.message,
      trendingMovies: [],
      trendingTV: [],
      popularMovies: [],
      topRated: [],
      actionMovies: [],
      comedyMovies: [],
      horrorMovies: [],
      animationMovies: [],
      documentaries: [],
      kidsMovies: []
    })
  }
}
