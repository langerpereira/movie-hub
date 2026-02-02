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

      <style jsx>{`
        .header-search {
          position: relative;
          width: 100%;
          max-width: 300px;
        }
        .header-search-container {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.1); 
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 25px; 
          padding: 5px 16px; /* Reduced vertical padding */
          transition: all 0.3s ease;
          width: 100%;
        }
        .header-search-container:focus-within {
          background: rgba(0, 0, 0, 0.8);
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(229, 9, 20, 0.2);
        }
        .header-search-icon {
          font-size: 14px;
          margin-right: 8px;
          opacity: 0.7;
        }
        .header-search-input {
          background: transparent;
          border: none;
          color: white;
          width: 100%;
          font-size: 14px; 
          outline: none;
        }
        .header-search-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
        
        /* Dropdown Results */
        .header-search-results {
          position: absolute;
          top: calc(100% + 5px);
          left: 0;
          right: 0;
          background: #111;
          border: 1px solid #333;
          border-radius: 4px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
          z-index: 1000;
        }
        .header-search-loading {
          padding: 10px;
          text-align: center;
          color: #888;
          font-size: 12px;
        }
        .header-search-item {
          display: flex;
          align-items: center;
          padding: 8px;
          cursor: pointer;
          border-bottom: 1px solid #222;
        }
        .header-search-item:last-child {
          border-bottom: none;
        }
        .header-search-item:hover {
          background: #222;
        }
        .header-search-poster {
          width: 30px;
          height: 45px;
          border-radius: 2px;
          margin-right: 10px;
        }
        .header-search-poster-empty {
          width: 30px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #222;
          font-size: 16px;
          border-radius: 2px;
          margin-right: 10px;
        }
        .header-search-info {
          flex: 1;
          overflow: hidden;
        }
        .header-search-title {
          color: #ddd;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .header-search-meta {
          font-size: 11px;
          color: #666;
        }
      `}</style>
    </div>
  )
}
