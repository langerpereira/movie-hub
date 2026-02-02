/* FILE: app/tv/[id]/page.jsx */
import { getTvDetails, getPosterUrl } from '@/lib/tmdb'
import IframeRenderer from '@/components/IframeRenderer'
import WatchPartyButton from '@/components/WatchPartyButton'
import Image from 'next/image'

async function getTvReviews(id) {
    const apiKey = process.env.TMDB_API_KEY
    if (!apiKey || apiKey === 'YOUR_TMDB_API_KEY_HERE') return null

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/tv/${id}/reviews?api_key=${apiKey}`,
            { next: { revalidate: 3600 } }
        )
        if (!response.ok) return null
        const data = await response.json()
        return data.results || []
    } catch (error) {
        return null
    }
}

export default async function TvPage({ params }) {
    const { id } = params

    // Fetch TV details from TMDB (Strictly TV)
    const tvData = await getTvDetails(id)

    // Fetch reviews
    const reviews = await getTvReviews(id)

    // If TMDB API not configured or ID not found, show minimal UI
    const hasMetadata = tvData !== null

    return (
        <div className="movie-page">
            {/* Player Section */}
            <div style={{ background: 'var(--bg-dark)', paddingTop: '20px' }}>
                <div className="container">
                    {/* Explicitly set mediaType to 'tv' */}
                    <IframeRenderer tmdbId={id} mediaType="tv" seasonsData={tvData?.seasons || []} />
                </div>
            </div>

            {/* TV Details Section */}
            <div className="container movie-container">
                <div className="movie-header">
                    <div className="movie-poster-wrapper">
                        {hasMetadata && tvData.poster_path ? (
                            <Image
                                src={getPosterUrl(tvData.poster_path)}
                                alt={tvData.name}
                                width={200}
                                height={300}
                                className="movie-poster-detail"
                                priority
                            />
                        ) : (
                            <div
                                className="movie-poster-detail"
                                style={{
                                    width: '200px',
                                    height: '300px',
                                    background: 'var(--bg-card)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-secondary)',
                                    borderRadius: '12px',
                                }}
                            >
                                📺
                            </div>
                        )}
                    </div>

                    <div className="movie-info">
                        <h1 className="movie-title">
                            {hasMetadata ? tvData.name : `TMDB ID: ${id}`}
                        </h1>

                        {hasMetadata && (
                            <>
                                <div className="movie-meta">
                                    {tvData.first_air_date && (
                                        <span>📅 {new Date(tvData.first_air_date).getFullYear()}</span>
                                    )}
                                    {tvData.vote_average && (
                                        <span>⭐ {tvData.vote_average.toFixed(1)}/10</span>
                                    )}
                                    {tvData.number_of_seasons && (
                                        <span>📺 {tvData.number_of_seasons} Seasons</span>
                                    )}
                                    {tvData.number_of_episodes && (
                                        <span>🎬 {tvData.number_of_episodes} Episodes</span>
                                    )}
                                </div>

                                <div style={{ margin: '20px 0', display: 'flex', gap: '15px' }}>
                                    <WatchPartyButton tmdbId={id} mediaType="tv" />
                                    <button className="action-btn">
                                        + Add to List
                                    </button>
                                </div>

                                {tvData.genres && tvData.genres.length > 0 && (
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {tvData.genres.map((genre) => (
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

                                {tvData.overview && (
                                    <>
                                        <h2 style={{ fontSize: '20px', fontWeight: '700', marginTop: '24px', marginBottom: '12px' }}>
                                            Overview
                                        </h2>
                                        <p className="movie-overview">{tvData.overview}</p>
                                    </>
                                )}
                            </>
                        )}

                        {!hasMetadata && (
                            <div className="alert alert-warning" style={{ marginTop: '20px' }}>
                                <strong>Note:</strong> TMDB API key not configured. TV show metadata unavailable.
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
    const tvData = await getTvDetails(id)

    const title = tvData ? tvData.name : `TMDB ID: ${id}`
    const description = tvData?.overview || 'Stream TV shows online'

    return {
        title: `${title} - MovieStream`,
        description,
    }
}
