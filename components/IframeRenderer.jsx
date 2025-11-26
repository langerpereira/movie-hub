/* FILE: components/IframeRenderer.jsx */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'tmdb_iframes_v1'

// Available streaming servers
const SERVERS = [
  { name: 'VidSrc', url: (type, id) => `https://vidsrc.xyz/embed/${type}/${id}` },
  { name: 'VidBinge', url: (type, id) => `https://www.vidbinge.dev/embed/${type}/${id}` },
  { name: 'SmashyStream', url: (type, id) => `https://player.smashy.stream/${type}/${id}` },
  { name: 'AutoEmbed', url: (type, id) => `https://autoembed.co/tv/tmdb/${id}` },
  { name: '2Embed', url: (type, id) => `https://www.2embed.cc/embed/${id}` },
  { name: 'Moviev Cloud', url: (type, id) => `https://moviev.cloud/embed/${type}/${id}` }
]

export default function IframeRenderer({ tmdbId, mediaType = 'movie' }) {
  const [customIframe, setCustomIframe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentServer, setCurrentServer] = useState(0)

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
  const embedUrl = currentServerData.url(mediaType, tmdbId)

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

      {/* Player */}
      <div className="player-container">
        <iframe
          key={embedUrl}
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
