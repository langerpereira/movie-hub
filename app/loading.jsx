/* FILE: app/loading.jsx */
import MovieLoader from '@/components/MovieLoader'

export default function Loading() {
    return (
        <div className="loading-container">
            <MovieLoader text="Loading content..." />
        </div>
    )
}
