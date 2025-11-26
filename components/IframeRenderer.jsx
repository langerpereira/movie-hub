/* FILE: components/IframeRenderer.jsx */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'tmdb_iframes_v1'

// Available streaming servers
const SERVERS = [
  { name: 'VidSrc', url: (type, id, season, episode) => type === 'tv' ? `https://vidsrc.xyz/embed/${type}/${id}/${season}/${episode}` : `https://vidsrc.xyz/embed/${type}/${id}` },
  { name: 'VidSrc Pro', url: (type, id, season, episode) => type === 'tv' ? `https://vidsrc.pro/embed/${type}/${id}/${season}/${episode}` : `https://vidsrc.pro/embed/${type}/${id}` },
  { name: 'VidSrc.me', url: (type, id, season, episode) => type === 'tv' ? `https://vidsrc.me/embed/${type}/${id}/${season}/${episode}` : `https://vidsrc.me/embed/${type}/${id}` },
  { name: 'VidLink', url: (type, id, season, episode) => type === 'tv' ? `https://vidlink.pro/tv/${id}/${season}/${episode}` : `https://vidlink.pro/movie/${id}` },
  { name: 'AutoEmbed', url: (type, id, season, episode) => type === 'tv' ? `https://autoembed.co/tv/tmdb/${id}/${season}/${episode}` : `https://autoembed.co/movie/tmdb/${id}` },
  { name: 'NontonGo', url: (type, id, season, episode) => type === 'tv' ? `https://www.NontonGo.win/embed/tv/${id}/${season}/${episode}` : `https://www.NontonGo.win/embed/movie/${id}` },
  { name: 'VidBinge', url: (type, id, season, episode) => type === 'tv' ? `https://www.vidbinge.dev/embed/${type}/${id}/${season}/${episode}` : `https://www.vidbinge.dev/embed/${type}/${id}` },
  { name: 'SmashyStream', url: (type, id, season, episode) => type === 'tv' ? `https://player.smashy.stream/${type}/${id}?s=${season}&e=${episode}` : `https://player.smashy.stream/${type}/${id}` },
  { name: '2Embed', url: (type, id, season, episode) => type === 'tv' ? `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}` : `https://www.2embed.cc/embed/${id}` },
  { name: 'Multiembed', url: (type, id, season, episode) => type === 'tv' ? `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season}&e=${episode}` : `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1` },
  { name: 'Moviev Cloud', url: (type, id, season, episode) => type === 'tv' ? `https://moviev.cloud/embed/${type}/${id}/${season}/${episode}` : `https://moviev.cloud/embed/${type}/${id}` }
]

export default function IframeRenderer({ tmdbId, mediaType = 'movie' }) {
  const [customIframe, setCustomIframe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentServer, setCurrentServer] = useState(0)
  const [season, setSeason] = useState(1)
  const [episode, setEpisode] = useState(1)

  useEffect(() => {
    // Check if admin has configured a custom iframe
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const entries = JSON.parse(stored)
        const html = entries[tmdbId]
        
        if (html) {
          setCustomIframe(html)
        }
      }
    } catch (error) {
      console.error('Failed to load iframe:', error)
    } finally {
      setLoading(false)
    }
  }, [tmdbId])

  const isTvShow = mediaType === 'tv'

  if (loading) {
    return (
      <div className="player-container">
        <div className="player-empty">
          <div className="loading">Loading player...</div>
        </div>
      </div>
    )
  }

  // Use custom iframe if configured in admin
  if (customIframe) {
    return (
      <div className="player-wrapper">
        <div className="player-container">
          <div dangerouslySetInnerHTML={{ __html: customIframe }} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    )
  }

  // Use automatic embed servers
  const currentServerData = SERVERS[currentServer]
  const embedUrl = currentServerData.url(mediaType, tmdbId, season, episode)

  return (
    <div className="player-wrapper">
      {/* Server Selector */}
      <div className="server-selector">
        <span className="server-label">Server:</span>
        <div className="server-buttons">
          {SERVERS.map((server, index) => (
            <button
              key={index}
              className={`server-btn ${currentServer === index ? 'active' : ''}`}
              onClick={() => setCurrentServer(index)}
            >
              {server.name}
            </button>
          ))}
        </div>
      </div>

      {/* Season & Episode Selector for TV Shows */}
      {isTvShow && (
        <div className="episode-selector">
          <div className="episode-controls">
            <div className="control-group">
              <label htmlFor="season-select">Season:</label>
              <input
                id="season-select"
                type="number"
                min="1"
                max="30"
                value={season}
                onChange={(e) => setSeason(Math.max(1, parseInt(e.target.value) || 1))}
                className="episode-input"
              />
            </div>
            <div className="control-group">
              <label htmlFor="episode-select">Episode:</label>
              <input
                id="episode-select"
                type="number"
                min="1"
                max="50"
                value={episode}
                onChange={(e) => setEpisode(Math.max(1, parseInt(e.target.value) || 1))}
                className="episode-input"
              />
            </div>
            <button 
              className="load-btn"
              onClick={() => {
                // Force reload by updating the key
                const currentServerData = SERVERS[currentServer]
                const newUrl = currentServerData.url(mediaType, tmdbId, season, episode)
                window.location.hash = `s${season}e${episode}`
              }}
            >
              Load Episode
            </button>
          </div>
        </div>
      )}

      {/* Player */}
      <div className="player-container">
        <iframe
          key={`${embedUrl}-${season}-${episode}`}
          src={embedUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="origin"
          style={{ border: 'none' }}
        />
      </div>
    </div>
  )
}
