'use client'

import { AuthProvider } from '@/context/AuthContext'
import Header from '@/components/Header'
import IntroScreen from '@/components/IntroScreen'
import Link from 'next/link'
import Script from 'next/script'

export default function ClientLayout({ children }) {
    return (
        <AuthProvider>
            <IntroScreen />
            <Header />
            <main className="main-content">{children}</main>

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
        </AuthProvider>
    )
}
