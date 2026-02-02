import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'users.json')

// Helper to read users
const getUsers = () => {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, '[]')
        return []
    }
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
}

// Helper to write users
const saveUsers = (users) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2))
}

export async function POST(request) {
    try {
        const body = await request.json()
        const { action, username, password, name } = body

        const users = getUsers()

        // LOGIN
        if (action === 'login') {
            const user = users.find(u => u.username === username && u.password === password)
            if (user) {
                // Return user info (exclude password)
                const { password, ...safeUser } = user
                return NextResponse.json({ success: true, user: safeUser })
            }
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
        }

        // REGISTER
        if (action === 'register') {
            if (users.find(u => u.username === username)) {
                return NextResponse.json({ success: false, error: 'Username taken' }, { status: 400 })
            }

            const newUser = {
                id: Date.now().toString(),
                username,
                password, // Storing plain text as requested for "simple/static" approach. In prod, HASH THIS!
                name: name || username,
                role: 'user'
            }

            users.push(newUser)
            saveUsers(users)

            const { password: p, ...safeUser } = newUser
            return NextResponse.json({ success: true, user: safeUser })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (err) {
        console.error('Auth error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
