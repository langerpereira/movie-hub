'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export default function LoginPage() {
    const router = useRouter()
    const { login, register, loginAsGuest } = useAuth()

    const [activeTab, setActiveTab] = useState('login') // 'login', 'register', 'guest'
    const [formData, setFormData] = useState({ username: '', password: '', name: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Check if there's a return URL in the query params
            const searchParams = new URLSearchParams(window.location.search)
            const returnUrl = searchParams.get('returnUrl') || '/'

            if (activeTab === 'login') {
                const res = await login(formData.username, formData.password)
                if (res.success) {
                    router.push(returnUrl)
                } else {
                    setError(res.error)
                }
            } else if (activeTab === 'register') {
                const res = await register(formData.username, formData.password, formData.name)
                if (res.success) {
                    router.push(returnUrl)
                } else {
                    setError(res.error)
                }
            } else if (activeTab === 'guest') {
                loginAsGuest(formData.name)
                router.push(returnUrl)
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">MovieStream</h1>

                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                        onClick={() => setActiveTab('login')}
                    >
                        Login
                    </button>
                    <button
                        className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                        onClick={() => setActiveTab('register')}
                    >
                        Sign Up
                    </button>
                    <button
                        className={`auth-tab ${activeTab === 'guest' ? 'active' : ''}`}
                        onClick={() => setActiveTab('guest')}
                    >
                        Guest
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="auth-error">{error}</div>}

                    {activeTab === 'guest' ? (
                        <div className="form-group">
                            <label>Display Name</label>
                            <input
                                type="text"
                                placeholder="Enter a Guest Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                    ) : (
                        <>
                            {activeTab === 'register' && (
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    placeholder="Enter username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? 'Processing...' : (
                            activeTab === 'login' ? 'Log In' :
                                activeTab === 'register' ? 'Create Account' : 'Continue as Guest'
                        )}
                    </button>
                </form>
            </div>

            <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          padding: 20px;
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
          background: #111;
          border: 1px solid #333;
          border-radius: 16px;
          padding: 40px;
        }
        .auth-title {
          text-align: center;
          margin-bottom: 30px;
          color: #e50914;
          font-weight: 800;
          font-style: italic;
        }
        .auth-tabs {
          display: flex;
          border-bottom: 1px solid #333;
          margin-bottom: 30px;
        }
        .auth-tab {
          flex: 1;
          padding: 12px;
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          font-weight: 600;
          border-bottom: 2px solid transparent;
          transition: all 0.3s ease;
        }
        .auth-tab.active {
          color: white;
          border-bottom-color: #e50914;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #ccc;
          font-size: 14px;
        }
        .form-group input {
          width: 100%;
          padding: 12px;
          background: #000;
          border: 1px solid #333;
          border-radius: 6px;
          color: white;
          outline: none;
        }
        .form-group input:focus {
          border-color: #e50914;
        }
        .auth-submit {
          width: 100%;
          padding: 14px;
          background: #e50914;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
        }
        .auth-submit:hover {
          background: #b20710;
        }
        .auth-error {
          background: rgba(229, 9, 20, 0.1);
          color: #e50914;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 14px;
          text-align: center;
        }
      `}</style>
        </div>
    )
}
