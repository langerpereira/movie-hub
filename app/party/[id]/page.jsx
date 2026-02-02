'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import IframeRenderer from '@/components/IframeRenderer'
import { useAuth } from '@/context/AuthContext'

export default function PartyPage({ params }) {
  const { id: roomId } = params
  const { user } = useAuth()
  const [username, setUsername] = useState('')
  const [joined, setJoined] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [lastActionTimestamp, setLastActionTimestamp] = useState(0)
  const [copied, setCopied] = useState(false)

  // Sync Overlay State
  const [countdown, setCountdown] = useState(null) // 3, 2, 1, GO
  const [showOverlay, setShowOverlay] = useState(false)

  // URL Params for media (e.g., ?tmdbId=123&mediaType=movie)
  // We need to parse these from window location since we are in a dynamic route
  const [mediaConfig, setMediaConfig] = useState(null)

  useEffect(() => {
    // Parse query params for media info
    const searchParams = new URLSearchParams(window.location.search)
    const tmdbId = searchParams.get('tmdbId')
    const mediaType = searchParams.get('mediaType') || 'movie'
    const season = searchParams.get('season')
    const episode = searchParams.get('episode')

    if (tmdbId) {
      setMediaConfig({ tmdbId, mediaType, season, episode })
    }
  }, [])

  // Join logic
  const handleJoin = (e) => {
    e.preventDefault()
    if (username.trim()) {
      setJoined(true)
      // Send join message
      sendMessage('joined the party!')
    }
  }

  // Polling logic (The "No Backend" magic)
  useEffect(() => {
    if (!joined) return

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/party?roomId=${roomId}`)
        if (res.ok) {
          const data = await res.json()
          setMessages(data.messages || [])

          // Check for new actions
          if (data.action && data.action.timestamp > lastActionTimestamp) {
            setLastActionTimestamp(data.action.timestamp)
            handleRemoteAction(data.action.type)
          }
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 1000) // Poll every second

    return () => clearInterval(pollInterval)
  }, [joined, roomId, lastActionTimestamp])

  const handleRemoteAction = (type) => {
    if (type === 'SYNC_START') {
      startCountdown()
    }
  }

  const startCountdown = () => {
    setShowOverlay(true)
    setCountdown(3)

    let count = 3
    const timer = setInterval(() => {
      count--
      if (count > 0) {
        setCountdown(count)
      } else if (count === 0) {
        setCountdown('GO! ▶')
        // Here users should manually click play
      } else {
        clearInterval(timer)
        setTimeout(() => setShowOverlay(false), 1500)
      }
    }, 1000)
  }

  const triggerSync = async () => {
    await fetch('/api/party', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        type: 'ACTION',
        payload: { actionType: 'SYNC_START' }
      })
    })
  }

  const sendMessage = async (text) => {
    if (!text.trim()) return

    try {
      await fetch('/api/party', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          type: 'MESSAGE',
          payload: { user: username, text }
        })
      })
      setInputText('')
    } catch (err) {
      console.error('Send error:', err)
    }
  }

  // Auto-scroll chat
  const chatEndRef = useRef(null)
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!joined) {
    return (
      <div className="join-screen">
        <div className="join-card">
          <h1>🍿 Watch Party</h1>
          <p>Enter your name to join Room: {roomId}</p>
          <form onSubmit={handleJoin}>
            <input
              type="text"
              placeholder="Your Name"
              value={username || (user ? (user.name || user.username) : '')}
              onChange={e => setUsername(e.target.value)}
              className="join-input"
              autoFocus
            />
            <button type="submit" className="join-btn">Join Party</button>
          </form>
        </div>
        <style jsx>{`
          .join-screen {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000;
          }
          .join-card {
            background: #1a1a1a;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            border: 1px solid #333;
          }
          .join-input {
            width: 100%;
            padding: 12px;
            margin: 20px 0;
            border-radius: 8px;
            border: 1px solid #333;
            background: #000;
            color: white;
          }
          .join-btn {
            background: #e50914;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: bold;
            width: 100%;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="party-container">
      {/* Main Content Area */}
      <div className="party-main">
        <div className="party-video-wrapper">
          {mediaConfig ? (
            <div className="video-responsive">
              {/* Re-using your existing IframeRenderer but wrapping it */}
              <IframeRenderer
                tmdbId={mediaConfig.tmdbId}
                mediaType={mediaConfig.mediaType}
              // We rely on iframe renderer internal fetch for seasons for simplicity, 
              // or you could pass them if you fetched them server side.
              // For now let's assume simple movie watching.
              />
            </div>
          ) : (
            <div className="empty-state">No media selected. Go to home and click "Watch Party" on a movie.</div>
          )}

          {/* SYNC OVERLAY */}
          {showOverlay && (
            <div className="sync-overlay">
              <div className="countdown-text">{countdown}</div>
            </div>
          )}
        </div>

        <div className="party-controls">
          <button className="sync-btn" onClick={triggerSync}>
            ⏱ START SYNC COUNTDOWN (3... 2... 1...)
          </button>
          <div className="party-info">
            <button
              className={`invite-btn ${copied ? 'copied' : ''}`}
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
            >
              {copied ? '✅ Link Copied!' : '🔗 Copy Invite Link'}
            </button>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="party-sidebar">
        <div className="chat-header">
          <h3>💬 Chat ({messages.length})</h3>
        </div>
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-line ${msg.user === username ? 'me' : ''}`}>
              <span className="chat-user">{msg.user}: </span>
              <span className="chat-text">{msg.text}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="chat-input-area">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputText); }}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="chat-input"
            />
          </form>
        </div>
      </div>

      <style jsx>{`
        .party-container {
          display: flex;
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          bottom: 0;
          background: #000;
          overflow: hidden;
          z-index: 10;
        }
        .party-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #000;
          position: relative;
          overflow-y: auto;
          height: 100%;
        }
        .party-video-wrapper {
          flex: 1;
          background: #000;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .video-responsive {
          width: 100%;
          height: 100%;
        }
        .party-controls {
          height: 80px;
          background: #111;
          border-top: 1px solid #222;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
        }
        .sync-btn {
          background: #e50914;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 16px;
          cursor: pointer;
        }
        .sync-btn:hover {
          background: #b20710;
        }
        .party-sidebar {
          width: 350px;
          background: #1a1a1a;
          border-left: 1px solid #333;
          display: flex;
          flex-direction: column;
        }
        .chat-header {
          padding: 20px;
          border-bottom: 1px solid #333;
          background: #111;
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .chat-line {
          font-size: 14px;
          line-height: 1.4;
        }
        .chat-user {
          font-weight: bold;
          color: #aaa;
        }
        .chat-line.me .chat-user {
          color: #e50914;
        }
        .chat-text {
          color: #fff;
        }
        .chat-input-area {
          padding: 20px;
          border-top: 1px solid #333;
          background: #111;
        }
        .chat-input {
          width: 100%;
          padding: 12px;
          background: #000;
          border: 1px solid #333;
          border-radius: 20px;
          color: white;
          outline: none;
        }
        
        /* Invite Button */
        .invite-btn {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: #bbb;
          padding: 10px 20px;
          border-radius: 30px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .invite-btn:hover {
          background: rgba(255,255,255,0.2);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .invite-btn.copied {
          background: var(--success);
          color: white;
          border-color: var(--success);
        }
        
        /* SYNC OVERLAY */
        .sync-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease;
          pointer-events: none; /* Let clicks pass through if needed, though we want them to wait */
        }
        .countdown-text {
          font-size: 120px;
          font-weight: 900;
          color: #fff;
          text-shadow: 0 0 50px #e50914;
          animation: pulse 1s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .party-container {
            flex-direction: column;
            height: auto;
            min-height: calc(100vh - 70px);
          }
          .party-main {
            height: 60vh;
            min-height: 400px;
          }
          .party-sidebar {
            width: 100%;
            height: 40vh;
            border-left: none;
            border-top: 1px solid #333;
          }
          .party-controls {
            flex-direction: column;
            height: auto;
            padding: 15px;
            gap: 10px;
          }
          .sync-btn {
            width: 100%;
            font-size: 14px;
            padding: 10px 16px;
          }
          .invite-btn {
            font-size: 14px;
            padding: 8px 16px;
          }
          .countdown-text {
            font-size: 60px;
          }
        }
      `}</style>
    </div >
  )
}
