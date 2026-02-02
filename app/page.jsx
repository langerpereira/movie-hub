'use client'

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import MovieLoader from '@/components/MovieLoader'

// Move MovieCarousel outside and memoize it
const MovieCarousel = memo(({ title, items, icon = '🎬', mediaType = 'movie' }) => {
  const carouselRef = useRef(null)
  const router = useRouter()

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (!items || items.length === 0) return null

  return (
    <section className="carousel-section" data-scroll data-scroll-speed="0.5">
      <div className="carousel-header">
        <h2 className="carousel-title-text">
          <span className="carousel-icon">{icon}</span>
          <span className="carousel-title-main">{title}</span>
        </h2>
        <div className="carousel-nav">
          <button className="carousel-btn" onClick={() => scroll('left')}>←</button>
          <button className="carousel-btn" onClick={() => scroll('right')}>→</button>
        </div>
      </div>
      <div className="carousel-wrapper">
        <div className="carousel" ref={carouselRef}>
          {items.slice(0, 20).map((item, index) => (
            <div
              key={item.id}
              className="carousel-item"
              onClick={() => router.push(`/${mediaType}/${item.id}`)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="carousel-item-inner">
                {item.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                    alt={item.title || item.name}
                    width={200}
                    height={300}
                    className="carousel-poster"
                  />
                ) : (
                  <div className="carousel-poster carousel-poster-empty" />
                )}
                <div className="carousel-overlay">
                  <span className="play-icon">▶</span>
                </div>
              </div>
              <div className="carousel-info">
                <div className="carousel-item-title">{item.title || item.name}</div>
                <div className="carousel-meta">
                  {item.vote_average ? `⭐ ${item.vote_average.toFixed(1)}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

MovieCarousel.displayName = 'MovieCarousel'

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
  const [pageLoading, setPageLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const router = useRouter()
  const slideCountRef = useRef(0)
  const scrollRef = useRef(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  // Auto-slide for hero carousel - using ref to avoid dependency issues
  useEffect(() => {
    slideCountRef.current = Math.min(5, categories.trendingMovies.length)
  }, [categories.trendingMovies.length])

  useEffect(() => {
    const interval = setInterval(() => {
      if (slideCountRef.current > 0) {
        setCurrentSlide((prev) => (prev + 1) % slideCountRef.current)
      }
    }, 6000)
    return () => clearInterval(interval)
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

  const featuredMovie = categories.trendingMovies[currentSlide]

  // Show movie loader while page is loading
  if (pageLoading) {
    return (
      <div className="homepage">
        <MovieLoader text="Loading Movies..." />
      </div>
    )
  }

  return (
    <div className="homepage" ref={scrollRef} data-scroll-container>
      {/* Hero Carousel Section */}
      <div className="hero-section">
        <div className="hero-slides">
          {categories.trendingMovies.slice(0, 5).map((movie, index) => (
            <div
              key={movie.id}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              style={{
                backgroundImage: movie.backdrop_path
                  ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
                  : 'none'
              }}
            />
          ))}
        </div>
        <div className="hero-gradient"></div>

        <div className="container hero-content">
          <div className="hero-text" data-scroll data-scroll-speed="1">
            <span className="hero-badge">🔥 Trending Now</span>
            <h1 className="hero-title">
              {featuredMovie?.title || 'Welcome to MovieStream'}
            </h1>
            <p className="hero-description">
              {featuredMovie?.overview?.slice(0, 200) || 'Unlimited movies, TV shows, and more. Watch anywhere. Stream instantly.'}
              {featuredMovie?.overview?.length > 200 ? '...' : ''}
            </p>
            <div className="hero-actions">
              {featuredMovie && (
                <>
                  <button
                    className="btn-hero-primary"
                    onClick={() => router.push(`/movie/${featuredMovie.id}`)}
                  >
                    <span className="btn-icon">▶</span> Play Now
                  </button>
                  <button className="btn-hero-secondary">
                    <span className="btn-icon">ℹ</span> More Info
                  </button>
                </>
              )}
            </div>

            {/* Hero Dots */}
            <div className="hero-dots">
              {categories.trendingMovies.slice(0, 5).map((_, index) => (
                <button
                  key={index}
                  className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hot Content Section - Only Trending & Popular */}
      <div className="content-section">
        <div className="container">
          <MovieCarousel title="Trending Movies" items={categories.trendingMovies} icon="🔥" mediaType="movie" />
          <MovieCarousel title="Hot TV Series" items={categories.trendingTV} icon="📺" mediaType="tv" />
          <MovieCarousel title="Popular Right Now" items={categories.popularMovies} icon="⭐" />
        </div>
      </div>

      {/* Diagonal Marquee Scroll Section - Locomotive Style */}
      <div className="diagonal-marquee-section">
        <div className="diagonal-marquee-wrapper">
          {/* First diagonal band */}
          <div className="diagonal-band band-1">
            <div className="band-track">
              <span>EDUCATIONAL PROJECT</span>
              <span className="separator">✦</span>
              <span>STREAM RESPONSIBLY</span>
              <span className="separator">✦</span>
              <span>LEARNING PURPOSES</span>
              <span className="separator">✦</span>
              <span>EDUCATIONAL PROJECT</span>
              <span className="separator">✦</span>
              <span>STREAM RESPONSIBLY</span>
              <span className="separator">✦</span>
              <span>LEARNING PURPOSES</span>
              <span className="separator">✦</span>
              <span>EDUCATIONAL PROJECT</span>
              <span className="separator">✦</span>
              <span>STREAM RESPONSIBLY</span>
              <span className="separator">✦</span>
            </div>
          </div>

          {/* Second diagonal band */}
          <div className="diagonal-band band-2">
            <div className="band-track reverse">
              <span>FOR EDUCATION</span>
              <span className="separator">◆</span>
              <span>SCROLL IN THIS DIRECTION</span>
              <span className="separator">◆</span>
              <span>SOOO CUSTOM</span>
              <span className="separator">◆</span>
              <span>FOR EDUCATION</span>
              <span className="separator">◆</span>
              <span>SCROLL IN THIS DIRECTION</span>
              <span className="separator">◆</span>
              <span>SOOO CUSTOM</span>
              <span className="separator">◆</span>
              <span>FOR EDUCATION</span>
              <span className="separator">◆</span>
              <span>SCROLL IN THIS DIRECTION</span>
              <span className="separator">◆</span>
            </div>
          </div>

          {/* Third diagonal band */}
          <div className="diagonal-band band-3">
            <div className="band-track">
              <span>MOVIE STREAM</span>
              <span className="separator">★</span>
              <span>WATCH ANYWHERE</span>
              <span className="separator">★</span>
              <span>FREE FOREVER</span>
              <span className="separator">★</span>
              <span>MOVIE STREAM</span>
              <span className="separator">★</span>
              <span>WATCH ANYWHERE</span>
              <span className="separator">★</span>
              <span>FREE FOREVER</span>
              <span className="separator">★</span>
              <span>MOVIE STREAM</span>
              <span className="separator">★</span>
              <span>WATCH ANYWHERE</span>
              <span className="separator">★</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
