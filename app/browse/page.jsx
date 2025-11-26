'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function BrowsePage() {
  const [categories, setCategories] = useState({
    trendingMovies: [],
    trendingTV: [],
    popularMovies: [],
    topRated: []
  })
  const [genres, setGenres] = useState([])
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [genreMovies, setGenreMovies] = useState([])
  const router = useRouter()

  useEffect(() => {
    fetchTrending()
    fetchGenres()
  }, [])

  const fetchTrending = async () => {
    try {
      const response = await fetch('/api/trending')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch trending:', error)
    }
  }

  const fetchGenres = async () => {
    try {
      const response = await fetch('/api/genres')
      if (response.ok) {
        const data = await response.json()
        setGenres(data.genres || [])
      }
    } catch (error) {
      console.error('Failed to fetch genres:', error)
    }
  }

  const fetchMoviesByGenre = async (genreId) => {
    try {
      const response = await fetch(`/api/genres/${genreId}`)
      if (response.ok) {
        const data = await response.json()
        setGenreMovies(data.results || [])
      }
    } catch (error) {
      console.error('Failed to fetch genre movies:', error)
    }
  }

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre)
    fetchMoviesByGenre(genre.id)
  }

  const MovieCarousel = ({ title, items, showAll = false }) => {
    if (!items || items.length === 0) return null

    return (
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>{title}</h2>
        <div className={showAll ? 'movie-grid' : 'carousel'}>
          {items.slice(0, showAll ? 50 : 20).map((item) => (
            <div
              key={item.id}
              className={showAll ? 'movie-card' : 'carousel-item'}
              onClick={() => router.push(`/movie/${item.id}`)}
            >
              {item.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                  alt={item.title || item.name}
                  width={200}
                  height={300}
                  className={showAll ? 'movie-poster' : 'carousel-poster'}
                />
              ) : (
                <div className={showAll ? 'movie-poster' : 'carousel-poster'} style={{ width: '200px', height: '300px', background: 'var(--bg-hover)' }} />
              )}
              <div className={showAll ? 'movie-info' : 'carousel-info'}>
                <div className={showAll ? 'movie-title' : 'carousel-title'}>{item.title || item.name}</div>
                <div className={showAll ? 'movie-meta' : 'carousel-meta'}>
                  {item.vote_average ? `⭐ ${item.vote_average.toFixed(1)}` : ''}
                  {item.release_date && ` • ${item.release_date.split('-')[0]}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <div style={{ paddingTop: '20px' }}>
      <div className="container">
        {/* Browse Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '12px' }}>
            Browse Movies & Series
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
            Discover thousands of movies and TV shows
          </p>
        </div>

        {/* Genre Filter */}
        {genres.length > 0 && (
          <section style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>🎭 Browse by Genre</h2>
            <div className="genre-chips">
              <div
                className={`genre-chip ${!selectedGenre ? 'active' : ''}`}
                onClick={() => {
                  setSelectedGenre(null)
                  setGenreMovies([])
                }}
              >
                All
              </div>
              {genres.slice(0, 15).map((genre) => (
                <div
                  key={genre.id}
                  className={`genre-chip ${selectedGenre?.id === genre.id ? 'active' : ''}`}
                  onClick={() => handleGenreClick(genre)}
                >
                  {genre.name}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Genre-filtered Movies */}
        {selectedGenre && genreMovies.length > 0 && (
          <MovieCarousel 
            title={`${selectedGenre.name} Movies`} 
            items={genreMovies} 
            showAll={true}
          />
        )}

        {/* Default Categories */}
        {!selectedGenre && (
          <>
            <MovieCarousel title="🔥 Trending Movies This Week" items={categories.trendingMovies} />
            <MovieCarousel title="📺 Trending TV Shows" items={categories.trendingTV} />
            <MovieCarousel title="⭐ Popular Movies" items={categories.popularMovies} />
            <MovieCarousel title="🏆 Top Rated" items={categories.topRated} />
          </>
        )}
      </div>
    </div>
  )
}
