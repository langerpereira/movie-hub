'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HeaderSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const searchRef = useRef(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
    setIsOpen(true)

    // Debounce search
    const timeoutId = setTimeout(() => {
      searchMovies(value)
    }, 300)

    return () => clearTimeout(timeoutId)
  }

  const handleResultClick = (item) => {
    if (item.media_type === 'tv') {
      router.push(`/tv/${item.id}`)
    } else {
      router.push(`/movie/${item.id}`)
    }
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div className="header-search" ref={searchRef}>
      <div className="header-search-container">
        <span className="header-search-icon">🔍</span>
        <input
          type="text"
          className="header-search-input"
          placeholder="Search movies..."
          value={query}
          onChange={handleSearch}
          onFocus={() => setIsOpen(true)}
          autoComplete="off"
        />
      </div>

      {isOpen && query && (results.length > 0 || loading) && (
        <div className="header-search-results">
          {loading ? (
            <div className="header-search-loading">Searching...</div>
          ) : (
            results.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="header-search-item"
                onClick={() => handleResultClick(item)}
              >
                {item.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                    alt={item.title || item.name}
                    className="header-search-poster"
                  />
                ) : (
                  <div className="header-search-poster header-search-poster-empty">🎬</div>
                )}
                <div className="header-search-info">
                  <div className="header-search-title">{item.title || item.name}</div>
                  <div className="header-search-meta">
                    {item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || 'N/A'}
                    {' • '}
                    {item.media_type === 'tv' ? 'TV' : 'Movie'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
