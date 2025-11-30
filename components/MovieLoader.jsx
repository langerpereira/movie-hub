'use client'

export default function MovieLoader({ text = 'Loading...' }) {
  return (
    <div className="movie-loader">
      <div className="loader-content">
        <div className="loader-reel">
          <div className="reel-circle">
            <div className="reel-hole"></div>
            <div className="reel-hole"></div>
            <div className="reel-hole"></div>
            <div className="reel-hole"></div>
            <div className="reel-hole"></div>
            <div className="reel-hole"></div>
          </div>
        </div>
        <div className="loader-film">
          <div className="film-strip">
            <div className="film-frame"></div>
            <div className="film-frame"></div>
            <div className="film-frame"></div>
            <div className="film-frame"></div>
            <div className="film-frame"></div>
          </div>
        </div>
        <p className="loader-text">{text}</p>
      </div>
    </div>
  )
}
