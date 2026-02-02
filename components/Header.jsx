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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-full-width">
        <div className="header-content">
          <Link href="/" className="logo">
            <span className="logo-icon">▶</span>
            <span className="logo-text">Movie<span className="logo-accent">Stream</span></span>
          </Link>

          {/* Desktop Search - Hidden on mobile */}
          <div className="desktop-search">
            <HeaderSearch />
          </div>

          <div className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>

          <nav className={`nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            {/* Mobile-only close button */}
            <div className="mobile-close" onClick={() => setIsMobileMenuOpen(false)}>✕</div>

            {/* Mobile Only: Search Bar inside Menu */}
            <div className="mobile-menu-search">
              <HeaderSearch />
            </div>

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
        .header.scrolled {
           background: rgba(0,0,0,0.95);
           box-shadow: 0 5px 20px rgba(0,0,0,0.5);
        }
        .header-full-width {
          width: 100%;
          padding: 0 40px; 
        }
        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        /* Logo uses flex-shrink: 0 to never squish */
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          margin-right: 20px;
          flex-shrink: 0;
          order: 1; /* Explicitly first */
        }
        .logo-icon { font-size: 24px; color: white; }
        .logo-text { font-family: var(--font-display); font-size: 24px; font-weight: 700; color: white; letter-spacing: -0.5px; }
        .logo-accent { color: var(--primary); }

        /* Desktop Nav Styles */
        .nav {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-left: auto;
        }
        .nav-link {
          position: relative;
          color: #bbb;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          padding: 8px;
          transition: color 0.3s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .nav-link:hover, .nav-link.active { color: white; }
        .nav-line {
          position: absolute; bottom: 0; left: 50%; width: 0; height: 2px;
          background: var(--primary); transition: all 0.3s ease; transform: translateX(-50%);
        }
        .nav-link:hover .nav-line, .nav-link.active .nav-line { width: 80%; }
        
        .nav-user-menu { display: flex; align-items: center; gap: 15px; margin-left: 20px; }
        .user-name { color: var(--primary); font-weight: bold; }
        .nav-logout {
          background: rgba(255,255,255,0.1); color: white; border: none; padding: 5px 10px;
          border-radius: 4px; font-size: 12px; cursor: pointer;
        }
        .nav-logout:hover { background: var(--primary); }
        .nav-login-btn { background: var(--primary); border-radius: 6px; margin-left: 10px; padding: 6px 16px; }
        .nav-login-btn .nav-text { color: white; font-weight: bold; }

        .mobile-menu-search { display: none; } /* Hidden on desktop */
        .desktop-search { display: block; margin-right: 20px; order: 2; }

        /* Mobile specific elements */
        .mobile-toggle { 
            display: none; 
            cursor: pointer; 
            flex-direction: column; 
            gap: 5px; 
            z-index: 1002; 
            order: 3; /* Explicitly last */
        }    
        .bar { width: 25px; height: 3px; background-color: white; border-radius: 3px; }
        .mobile-close { display: none; position: absolute; top: 20px; right: 20px; font-size: 24px; cursor: pointer; padding: 10px; color: white; }
        
        /* Mobile Responsive Styles - Trigger at 1024px */
        @media (max-width: 1024px) {
           .header-full-width { padding: 0 20px; }
           
           .logo-icon { font-size: 15px; }
           .logo-text { font-size: 20px; } /* Optional: adjusting text to match better */

           /* CRITICAL: Hide desktop search to clear room for Logo + Toggle */
           .desktop-search { display: none; } 
           
           .mobile-menu-search { 
              display: block; 
              width: 100%; 
              padding-bottom: 20px; 
              border-bottom: 1px solid rgba(255,255,255,0.1);
              margin-bottom: 20px;
           }

           .mobile-toggle { display: flex; margin-left: auto; } /* Auto margin pushes it to right */
           
           .nav {
             position: fixed;
             top: 0;
             right: -100%; /* Hidden by default */
             width: 80%; /* Slightly wider menu */
             height: 100vh;
             background: rgba(0,0,0,0.98);
             backdrop-filter: blur(10px);
             flex-direction: column;
             align-items: flex-start;
             justify-content: flex-start;
             padding: 80px 30px;
             transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
             box-shadow: -5px 0 30px rgba(0,0,0,0.8);
             border-left: 1px solid #222;
             z-index: 1001;
           }
           
           .nav.mobile-open {
             right: 0;
           }
           
           .mobile-close { display: block; }
           
           .nav-link {
             width: 100%;
             padding: 20px 0;
             font-size: 18px;
             border-bottom: 1px solid rgba(255,255,255,0.1);
           }
           
           .nav-user-menu {
             margin-top: 20px;
             margin-left: 0;
             flex-direction: column;
             align-items: flex-start;
             width: 100%;
             gap: 20px;
           }
           
           .user-name { font-size: 18px; }
           
           .nav-logout, .nav-login-btn {
             width: 100%;
             text-align: center;
             padding: 12px;
             margin-left: 0;
             font-size: 16px;
           }
        }
      `}</style>
    </header>
  )
}
