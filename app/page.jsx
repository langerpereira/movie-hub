'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function HomePage() {
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
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
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
    }
  }

  const searchMovies = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    const value = e.target.value
    setQuery(value)
    
    const timeoutId = setTimeout(() => {
      searchMovies(value)
    }, 300)

    return () => clearTimeout(timeoutId)
  }

  const handleResultClick = (id) => {
    router.push(`/movie/${id}`)
    setQuery('')
    setResults([])
  }

  const MovieCarousel = ({ title, items, icon = '🎬' }) => {
    if (!items || items.length === 0) return null

    return (
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>
          {icon} {title}
        </h2>
        <div className="carousel">
          {items.slice(0, 20).map((item) => (
            <div
              key={item.id}
              className="carousel-item"
              onClick={() => router.push(`/movie/${item.id}`)}
            >
              {item.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                  alt={item.title || item.name}
                  width={200}
                  height={300}
                  className="carousel-poster"
                />
              ) : (
                <div className="carousel-poster" style={{ width: '200px', height: '300px', background: 'var(--bg-hover)' }} />
              )}
              <div className="carousel-info">
                <div className="carousel-title">{item.title || item.name}</div>
                <div className="carousel-meta">
                  {item.vote_average ? `⭐ ${item.vote_average.toFixed(1)}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <div className="homepage">
      {/* Hero Section with Featured Movie */}
      <div className="hero-section">
        <div className="hero-overlay"></div>
        {categories.trendingMovies[0] && (
          <div 
            className="hero-background"
            style={{
              backgroundImage: categories.trendingMovies[0].backdrop_path 
                ? `url(https://image.tmdb.org/t/p/original${categories.trendingMovies[0].backdrop_path})`
                : 'none'
            }}
          />
        )}
        <div className="container hero-content">
          <div style={{ maxWidth: '600px' }}>
            <h1 className="hero-featured-title">
              {categories.trendingMovies[0]?.title || 'Welcome to MovieStream'}
            </h1>
            <p className="hero-featured-desc">
              {categories.trendingMovies[0]?.overview || 'Unlimited movies, TV shows, and more. Watch anywhere. Stream instantly.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              {categories.trendingMovies[0] && (
                <button 
                  className="btn btn-primary btn-large"
                  onClick={() => router.push(`/movie/${categories.trendingMovies[0].id}`)}
                >
                  ▶️ Play Now
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="search-container" style={{ marginTop: '40px', maxWidth: '600px' }}>
            <input
              type="text"
              className="input search-input"
              placeholder="Search for movies or TV shows..."
              value={query}
              onChange={handleSearch}
              autoComplete="off"
            />
            
            {query && results.length > 0 && (
              <div className="search-results">
                {results.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    className="search-result-item"
                    onClick={() => handleResultClick(item.id)}
                  >
                    {item.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                        alt={item.title || item.name}
                        className="search-poster"
                      />
                    ) : (
                      <div className="search-poster" style={{ background: 'var(--bg-hover)' }} />
                    )}
                    <div className="search-info">
                      <div className="search-title">{item.title || item.name}</div>
                      <div className="search-year">
                        {item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || 'N/A'}
                        {' • '}
                        {item.media_type === 'tv' ? 'TV Show' : 'Movie'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {query && loading && (
              <div className="search-results">
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Searching...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        <MovieCarousel title="Trending Now" items={categories.trendingMovies} icon="🔥" />
        <MovieCarousel title="Popular on MovieStream" items={categories.popularMovies} icon="⭐" />
        <MovieCarousel title="Action & Adventure" items={categories.actionMovies} icon="💥" />
        <MovieCarousel title="Comedy" items={categories.comedyMovies} icon="😂" />
        <MovieCarousel title="Horror" items={categories.horrorMovies} icon="👻" />
        <MovieCarousel title="Kids & Family" items={categories.kidsMovies} icon="👶" />
        <MovieCarousel title="Animation" items={categories.animationMovies} icon="🎨" />
        <MovieCarousel title="Documentaries" items={categories.documentaries} icon="📚" />
        <MovieCarousel title="TV Shows" items={categories.trendingTV} icon="📺" />
        <MovieCarousel title="Top Rated" items={categories.topRated} icon="🏆" />
      </div>
    </div>
  )
}
