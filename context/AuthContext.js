'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null) // { username, name, role }
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check local storage on load
        const stored = localStorage.getItem('movie_user')
        if (stored) {
            setUser(JSON.parse(stored))
        }
        setLoading(false)
    }, [])

    const login = async (username, password) => {
        const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', username, password })
        })
        const data = await res.json()

        if (data.success) {
            setUser(data.user)
            localStorage.setItem('movie_user', JSON.stringify(data.user))
            return { success: true }
        }
        return { success: false, error: data.error }
    }

    const register = async (username, password, name) => {
        const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'register', username, password, name })
        })
        const data = await res.json()

        if (data.success) {
            setUser(data.user)
            localStorage.setItem('movie_user', JSON.stringify(data.user))
            return { success: true }
        }
        return { success: false, error: data.error }
    }

    const loginAsGuest = (name) => {
        const guestUser = {
            id: 'guest-' + Date.now(),
            username: 'guest',
            name: name || 'Guest',
            role: 'guest'
        }
        setUser(guestUser)
        localStorage.setItem('movie_user', JSON.stringify(guestUser))
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('movie_user')
        router.push('/')
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, loginAsGuest, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
