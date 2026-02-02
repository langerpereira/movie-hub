import { NextResponse } from 'next/server'
import { getRoom, addMessage, setAction } from '@/lib/partyStore'

export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')

    if (!roomId) {
        return NextResponse.json({ error: 'Room ID required' }, { status: 400 })
    }

    const room = getRoom(roomId)
    return NextResponse.json(room)
}

export async function POST(request) {
    try {
        const body = await request.json()
        const { roomId, type, payload } = body

        if (!roomId || !type) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        if (type === 'MESSAGE') {
            const msg = addMessage(roomId, payload.user, payload.text)
            return NextResponse.json({ success: true, data: msg })
        }

        if (type === 'ACTION') {
            const action = setAction(roomId, payload.actionType)
            return NextResponse.json({ success: true, data: action })
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
