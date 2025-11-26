/* FILE: app/movie/[id]/page.jsx */
import { getMovieDetails, getTvDetails, getPosterUrl } from '@/lib/tmdb'
import IframeRenderer from '@/components/IframeRenderer'
import Image from 'next/image'

async function getMovieReviews(id) {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey || apiKey === 'YOUR_TMDB_API_KEY_HERE') return null

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}/reviews?api_key=${apiKey}`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return null
    const data = await response.json()
    return data.results || []
  } catch (error) {
    return null
  }
}

export default async function MoviePage({ params }) {
  const { id } = params

  // Try to fetch movie details from TMDB
  let movieData = await getMovieDetails(id)
  
  // If not a movie, try TV show
  if (!movieData) {
    movieData = await getTvDetails(id)
  }

  // Fetch reviews
  const reviews = await getMovieReviews(id)

  // If TMDB API not configured or ID not found, show minimal UI
  const hasMetadata = movieData !== null

  return (
    <div className="movie-page">
      {/* Player Section */}
      <div style={{ background: 'var(--bg-dark)', paddingTop: '20px' }}>
        <div className="container">
          <IframeRenderer tmdbId={id} mediaType={movieData?.name ? 'tv' : 'movie'} />
        </div>
      </div>

      {/* Movie Details Section */}
      <div className="container movie-container">
        <div className="movie-header">
          <div>
            {hasMetadata && movieData.poster_path ? (
              <Image
                src={getPosterUrl(movieData.poster_path)}
                alt={movieData.title || movieData.name}
                width={300}
                height={450}
                className="movie-poster"
                priority
              />
            ) : (
              <div
                className="movie-poster"
                style={{
                  width: '300px',
                  height: '450px',
                  background: 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                }}
              >
                🎬
              </div>
            )}
          </div>

          <div className="movie-info">
            <h1 className="movie-title">
              {hasMetadata ? (movieData.title || movieData.name) : `TMDB ID: ${id}`}
            </h1>

            {hasMetadata && (
              <>
                <div className="movie-meta">
                  {movieData.release_date && (
                    <span>📅 {new Date(movieData.release_date).getFullYear()}</span>
                  )}
                  {movieData.first_air_date && (
                    <span>📅 {new Date(movieData.first_air_date).getFullYear()}</span>
                  )}
                  {movieData.runtime && (
                    <span>⏱️ {movieData.runtime} min</span>
                  )}
                  {movieData.vote_average && (
                    <span>⭐ {movieData.vote_average.toFixed(1)}/10</span>
                  )}
                  {movieData.number_of_seasons && (
                    <span>📺 {movieData.number_of_seasons} Seasons</span>
                  )}
                </div>

                {movieData.genres && movieData.genres.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {movieData.genres.map((genre) => (
                      <span
                        key={genre.id}
                        style={{
                          padding: '6px 14px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '500',
                        }}
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}

                {movieData.overview && (
                  <>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>
                      Overview
                    </h2>
                    <p className="movie-overview">{movieData.overview}</p>
                  </>
                )}
              </>
            )}

            {!hasMetadata && (
              <div className="alert alert-warning" style={{ marginTop: '20px' }}>
                <strong>Note:</strong> TMDB API key not configured. Movie metadata unavailable.
                <br />
                Add your API key in <code>.env.local</code> to enable metadata.
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        {reviews && reviews.length > 0 && (
          <div className="reviews-section">
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '24px' }}>
              💬 User Reviews
            </h2>
            <div className="reviews-list">
              {reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="review-author">
                      {review.author_details?.avatar_path && (
                        <img
                          src={
                            review.author_details.avatar_path.startsWith('/http')
                              ? review.author_details.avatar_path.substring(1)
                              : `https://image.tmdb.org/t/p/w45${review.author_details.avatar_path}`
                          }
                          alt={review.author}
                          className="review-avatar"
                        />
                      )}
                      <div>
                        <div className="review-author-name">{review.author}</div>
                        {review.author_details?.rating && (
                          <div className="review-rating">
                            ⭐ {review.author_details.rating}/10
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="review-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="review-content">
                    {review.content.length > 500
                      ? `${review.content.substring(0, 500)}...`
                      : review.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Generate metadata for better SEO
export async function generateMetadata({ params }) {
  const { id } = params
  let movieData = await getMovieDetails(id)
  
  if (!movieData) {
    movieData = await getTvDetails(id)
  }

  const title = movieData ? (movieData.title || movieData.name) : `TMDB ID: ${id}`
  const description = movieData?.overview || 'Stream movies and series online'

  return {
    title: `${title} - MovieStream`,
    description,
  }
}
