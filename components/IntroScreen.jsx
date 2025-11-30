'use client'

import { useState, useEffect } from 'react'

export default function IntroScreen() {
  const [show, setShow] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = sessionStorage.getItem('hasVisitedMovieStream')
    
    if (!hasVisited) {
      setShow(true)
      sessionStorage.setItem('hasVisitedMovieStream', 'true')
      
      // Start fade out after 2 seconds
      setTimeout(() => {
        setFadeOut(true)
      }, 2000)
      
      // Remove intro after fade animation
      setTimeout(() => {
        setShow(false)
      }, 2500)
    }
  }, [])

  if (!show) return null

  return (
    <div className={`intro-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="intro-content">
        <div className="intro-logo">
          <span className="intro-icon">▶</span>
        </div>
        <div className="intro-text">
          <span className="intro-title">Movie<span className="intro-accent">Stream</span></span>
        </div>
        <div className="intro-loading-bar">
          <div className="intro-loading-progress"></div>
        </div>
      </div>
    </div>
  )
}
