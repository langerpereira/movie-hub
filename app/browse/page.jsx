'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import MovieLoader from '@/components/MovieLoader'

export default function BrowsePage() {
  const [categories, setCategories] = useState({
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
  const [genres, setGenres] = useState([])
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [genreMovies, setGenreMovies] = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
    fetchGenres()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setPageLoading(false)
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

  const MovieCarousel = ({ title, items, icon = '🎬', showAll = false }) => {
    if (!items || items.length === 0) return null

    return (
      <section className="carousel-section">
        <div className="carousel-header">
          <h2 className="carousel-title-text">
            <span className="carousel-icon">{icon}</span>
            <span className="carousel-title-main">{title}</span>
          </h2>
        </div>
        <div className={showAll ? 'movie-grid' : 'carousel'}>
          {items.slice(0, showAll ? 50 : 20).map((item, index) => (
            <div
              key={item.id}
              className={showAll ? 'movie-card' : 'carousel-item'}
              onClick={() => router.push(`/movie/${item.id}`)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="carousel-item-inner">
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
                <div className="carousel-overlay">
                  <span className="play-icon">▶</span>
                </div>
              </div>
              <div className={showAll ? 'movie-info' : 'carousel-info'}>
                <div className={showAll ? 'movie-title' : 'carousel-item-title'}>{item.title || item.name}</div>
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

  // Show movie loader while page is loading
  if (pageLoading) {
    return (
      <div className="browse-page">
        <MovieLoader text="Loading Content..." />
      </div>
    )
  }

  return (
    <div className="browse-page">
      <div className="container">
        {/* Browse Header */}
        <div className="browse-header">
          <h1 className="browse-title">
            Browse <span className="text-accent">Movies & Series</span>
          </h1>
          <p className="browse-subtitle">
            Discover thousands of movies and TV shows
          </p>
        </div>

        {/* Genre Filter */}
        {genres.length > 0 && (
          <section className="genre-section">
            <h2 className="section-title">🎭 Browse by Genre</h2>
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

        {/* All Categories */}
        {!selectedGenre && (
          <>
            <MovieCarousel title="Trending Movies" items={categories.trendingMovies} icon="🔥" />
            <MovieCarousel title="Trending TV Shows" items={categories.trendingTV} icon="📺" />
            <MovieCarousel title="Popular Movies" items={categories.popularMovies} icon="⭐" />
            <MovieCarousel title="Top Rated" items={categories.topRated} icon="🏆" />
            <MovieCarousel title="Action & Adventure" items={categories.actionMovies} icon="💥" />
            <MovieCarousel title="Comedy" items={categories.comedyMovies} icon="😂" />
            <MovieCarousel title="Horror" items={categories.horrorMovies} icon="👻" />
            <MovieCarousel title="Kids & Family" items={categories.kidsMovies} icon="👶" />
            <MovieCarousel title="Animation" items={categories.animationMovies} icon="🎨" />
            <MovieCarousel title="Documentaries" items={categories.documentaries} icon="📚" />
          </>
        )}
      </div>
    </div>
  )
}

