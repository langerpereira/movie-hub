/* FILE: lib/tmdb.js */

const TMDB_API_BASE = 'https://api.themoviedb.org/3'

/**
 * Fetch movie details from TMDB
 * @param {string|number} id - TMDB movie ID
 * @returns {Promise<Object|null>} Movie details or null
 */
export async function getMovieDetails(id) {
  const apiKey = process.env.TMDB_API_KEY

  if (!apiKey || apiKey === 'YOUR_TMDB_API_KEY_HERE') {
    return null
  }

  try {
    const response = await fetch(
      `${TMDB_API_BASE}/movie/${id}?api_key=${apiKey}`,
      { 
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('TMDB API error:', error)
    return null
  }
}

/**
 * Fetch TV show details from TMDB
 * @param {string|number} id - TMDB TV show ID
 * @returns {Promise<Object|null>} TV show details or null
 */
export async function getTvDetails(id) {
  const apiKey = process.env.TMDB_API_KEY

  if (!apiKey || apiKey === 'YOUR_TMDB_API_KEY_HERE') {
    return null
  }

  try {
    const response = await fetch(
      `${TMDB_API_BASE}/tv/${id}?api_key=${apiKey}`,
      { 
        next: { revalidate: 3600 }
      }
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('TMDB API error:', error)
    return null
  }
}

/**
 * Search for movies and TV shows
 * @param {string} query - Search query
 * @returns {Promise<Object>} Search results
 */
export async function searchMulti(query) {
  const apiKey = process.env.TMDB_API_KEY

  if (!apiKey || apiKey === 'YOUR_TMDB_API_KEY_HERE') {
    return { results: [] }
  }

  try {
    const response = await fetch(
      `${TMDB_API_BASE}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}`,
      { 
        next: { revalidate: 3600 }
      }
    )

    if (!response.ok) {
      return { results: [] }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('TMDB search error:', error)
    return { results: [] }
  }
}

/**
 * Get poster URL from TMDB path
 * @param {string} path - Poster path from TMDB
 * @param {string} size - Image size (w92, w154, w185, w342, w500, w780, original)
 * @returns {string} Full poster URL
 */
export function getPosterUrl(path, size = 'w500') {
  if (!path) return null
  return `https://image.tmdb.org/t/p/${size}${path}`
}

/**
 * Get backdrop URL from TMDB path
 * @param {string} path - Backdrop path from TMDB
 * @param {string} size - Image size (w300, w780, w1280, original)
 * @returns {string} Full backdrop URL
 */
export function getBackdropUrl(path, size = 'w1280') {
  if (!path) return null
  return `https://image.tmdb.org/t/p/${size}${path}`
}
