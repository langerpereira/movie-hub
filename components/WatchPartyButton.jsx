'use client'

import { useRouter } from 'next/navigation'

export default function WatchPartyButton({ tmdbId, mediaType, className = "action-btn" }) {
    const router = useRouter()

    const startParty = () => {
        const roomId = Math.random().toString(36).substr(2, 9)
        const partyUrl = `/party/${roomId}?tmdbId=${tmdbId}&mediaType=${mediaType}`
        console.log('Starting party:', partyUrl)
        router.push(partyUrl)
    }

    return (
        <button onClick={startParty} className={className}>
            🍿 Watch Party
        </button>
    )
}
