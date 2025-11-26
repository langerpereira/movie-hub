/* FILE: app/layout.jsx */
import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'MovieStream - Free Streaming Platform',
  description: 'Zero-DB movie streaming scaffold with TMDB integration',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container">
            <div className="header-content">
              <Link href="/" className="logo">
                🎬 MovieStream
              </Link>
              <nav className="nav">
                <Link href="/">Home</Link>
                <Link href="/browse">Browse</Link>
                <Link href="/admin">Admin</Link>
              </nav>
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="footer">
          <div className="container">
            <p>MovieStream - Educational Scaffold Project</p>
            <p className="footer-notice">
              ⚠️ This is a neutral technical scaffold. Do not embed copyrighted content you are not authorized to use.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
