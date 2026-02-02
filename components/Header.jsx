'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import HeaderSearch from './HeaderSearch'
import { useAuth } from '@/context/AuthContext'
import { usePathname } from 'next/navigation'

export default function Header() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-full-width">
        <div className="header-content">
          <Link href="/" className="logo">
            <span className="logo-icon">▶</span>
            <span className="logo-text">Movie<span className="logo-accent">Stream</span></span>
          </Link>

          <HeaderSearch />

          <nav className="nav">
            <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
              <span className="nav-text">Home</span>
              <span className="nav-line"></span>
            </Link>
            <Link href="/browse" className={`nav-link ${pathname === '/browse' ? 'active' : ''}`}>
              <span className="nav-text">Browse</span>
              <span className="nav-line"></span>
            </Link>
            <Link href="/party/demo?tmdbId=533535&mediaType=movie" className={`nav-link ${pathname?.startsWith('/party') ? 'active' : ''}`}>
              <span className="nav-text">🍿 Watch Party</span>
              <span className="nav-line"></span>
            </Link>

            {user ? (
              <div className="nav-user-menu group">
                <span className="nav-text user-name">👤 {user.name}</span>
                <button onClick={logout} className="nav-logout">Logout</button>
              </div>
            ) : (
              <Link href="/login" className="nav-link nav-login-btn">
                <span className="nav-text">Login</span>
              </Link>
            )}
          </nav>
        </div>
      </div>

      <style jsx>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 70px;
          display: flex;
          align-items: center;
          z-index: 1000;
          background: linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%);
          transition: all 0.3s ease;
        }
        .header-full-width {
          width: 100%;
          padding: 0 40px; /* Consistent padding from edges */
        }
        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        .nav-user-menu {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-left: 20px;
        }
        .user-name {
          color: var(--primary);
          font-weight: bold;
        }
        .nav-logout {
          background: rgba(255,255,255,0.1);
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }
        .nav-logout:hover {
          background: var(--primary);
        }
        .nav-login-btn {
          background: var(--primary);
          border-radius: 6px;
          margin-left: 10px;
        }
        .nav-login-btn .nav-text {
          color: white;
          font-weight: bold;
        }
        .header.scrolled {
           background: rgba(0,0,0,0.95);
           box-shadow: 0 5px 20px rgba(0,0,0,0.5);
        }
      `}</style>
    </header>
  )
}
