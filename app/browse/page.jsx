'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [mediaType, setMediaType] = useState('all') // 'all', 'movie', 'tv'
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
    const carouselRef = useRef(null)

    if (!items || items.length === 0) return null

    const scroll = (direction) => {
      if (carouselRef.current) {
        const scrollAmount = direction === 'left' ? -500 : 500
        carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
    }

    return (
      <section className="carousel-section">
        <div className="carousel-header">
          <h2 className="carousel-title-text">
            <span className="carousel-icon">{icon}</span>
            <span className="carousel-title-main">{title}</span>
          </h2>
          {!showAll && (
            <div className="carousel-nav">
              <button className="carousel-btn" onClick={() => scroll('left')}>←</button>
              <button className="carousel-btn" onClick={() => scroll('right')}>→</button>
            </div>
          )}
        </div>
        <div className={showAll ? 'movie-grid' : 'carousel'} ref={carouselRef}>
          {items.slice(0, showAll ? 50 : 20).map((item, index) => (
            <div
              key={item.id}
              className={showAll ? 'movie-card' : 'carousel-item'}
              onClick={() => {
                // Determine path based on item contents or title context if possible
                // Better approach: Check item properties or rely on list type
                // TV shows usually have 'name' and 'first_air_date', Movies 'title' and 'release_date'
                const isTv = item.name || item.first_air_date
                const type = isTv ? 'tv' : 'movie'
                router.push(`/${type}/${item.id}`)
              }}
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
                  {item.first_air_date && ` • ${item.first_air_date.split('-')[0]}`}
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

        {/* Media Type Filter */}
        <div className="filter-bar" style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
          <button
            className={`filter-btn ${mediaType === 'all' ? 'active' : ''}`}
            onClick={() => setMediaType('all')}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              background: mediaType === 'all' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            All
          </button>
          <button
            className={`filter-btn ${mediaType === 'movie' ? 'active' : ''}`}
            onClick={() => setMediaType('movie')}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              background: mediaType === 'movie' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Movies
          </button>
          <button
            className={`filter-btn ${mediaType === 'tv' ? 'active' : ''}`}
            onClick={() => setMediaType('tv')}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              background: mediaType === 'tv' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            TV Series
          </button>
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
            title={`${selectedGenre.name} ${mediaType === 'tv' ? 'Series' : 'Movies'}`}
            items={genreMovies}
            showAll={true}
          />
        )}

        {/* All Categories */}
        {!selectedGenre && (
          <>
            {(mediaType === 'all' || mediaType === 'movie') && (
              <>
                <MovieCarousel title="Trending Movies" items={categories.trendingMovies} icon="🔥" />
                <MovieCarousel title="Popular Movies" items={categories.popularMovies} icon="⭐" />
                <MovieCarousel title="Top Rated Movies" items={categories.topRated} icon="🏆" />
                <MovieCarousel title="Action & Adventure" items={categories.actionMovies} icon="💥" />
                <MovieCarousel title="Comedy" items={categories.comedyMovies} icon="😂" />
                <MovieCarousel title="Horror" items={categories.horrorMovies} icon="👻" />
                <MovieCarousel title="Kids & Family" items={categories.kidsMovies} icon="👶" />
                <MovieCarousel title="Animation" items={categories.animationMovies} icon="🎨" />
              </>
            )}

            {(mediaType === 'all' || mediaType === 'tv') && (
              <>
                <MovieCarousel title="Trending TV Shows" items={categories.trendingTV} icon="📺" />
                <MovieCarousel title="Documentaries" items={categories.documentaries} icon="📚" />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

