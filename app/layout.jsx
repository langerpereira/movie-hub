/* FILE: app/layout.jsx */
import './globals.css'
import Link from 'next/link'
import Script from 'next/script'
import IntroScreen from '@/components/IntroScreen'
import HeaderSearch from '@/components/HeaderSearch'

export const metadata = {
  title: 'MovieStream - Free Streaming Platform',
  description: 'Zero-DB movie streaming scaffold with TMDB integration',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <IntroScreen />
        
        <header className="header">
          <div className="container">
            <div className="header-content">
              <Link href="/" className="logo">
                <span className="logo-icon">▶</span>
                <span className="logo-text">Movie<span className="logo-accent">Stream</span></span>
              </Link>
              
              <HeaderSearch />
              
              <nav className="nav">
                <Link href="/" className="nav-link">
                  <span className="nav-text">Home</span>
                  <span className="nav-line"></span>
                </Link>
                <Link href="/browse" className="nav-link">
                  <span className="nav-text">Browse</span>
                  <span className="nav-line"></span>
                </Link>
                <Link href="/admin" className="nav-link">
                  <span className="nav-text">Admin</span>
                  <span className="nav-line"></span>
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-brand">
                <span className="footer-logo">▶ MovieStream</span>
                <p className="footer-tagline">Your gateway to endless entertainment</p>
              </div>
              <div className="footer-links">
                <Link href="/">Home</Link>
                <Link href="/browse">Browse</Link>
                <Link href="/admin">Admin</Link>
              </div>
            </div>
            <div className="footer-bottom">
              <p className="footer-notice">
                ⚠️ Educational Scaffold Project - For learning purposes only
              </p>
              <p className="footer-copyright">© 2024 MovieStream. All rights reserved.</p>
            </div>
          </div>
        </footer>

        <Script src="https://cdn.jsdelivr.net/npm/locomotive-scroll@4.1.4/dist/locomotive-scroll.min.js" strategy="beforeInteractive" />
      </body>
    </html>
  )
}
