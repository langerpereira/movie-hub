// Simple in-memory store for "Backend-less" Watch Party
// Note: Data will be lost if the server travels/restarts (serverless cold boots).
// For a persistent solution, use Redis/Firebase. For a couple watching together for 2 hours, this is fine.

/*
  Structure:
  global.partyRooms = {
    'room-id': {
      messages: [{ user: 'Alex', text: 'Hi', timestamp: 123 }],
      action: { type: null, timestamp: 0 }, // 'PLAY', 'PAUSE'
      lastActive: 123456789
    }
  }
*/

if (!global.partyRooms) {
    global.partyRooms = {}
}

export const getRoom = (roomId) => {
    if (!global.partyRooms[roomId]) {
        global.partyRooms[roomId] = {
            messages: [],
            action: null,
            lastActive: Date.now()
        }
    }
    return global.partyRooms[roomId]
}

export const addMessage = (roomId, user, text) => {
    const room = getRoom(roomId)
    const msg = { user, text, id: Date.now(), timestamp: Date.now() }
    room.messages.push(msg)

    // Keep only last 50 messages to save memory
    if (room.messages.length > 50) {
        room.messages.shift()
    }

    room.lastActive = Date.now()
    return msg
}

export const setAction = (roomId, type) => {
    const room = getRoom(roomId)
    room.action = { type, timestamp: Date.now() } // type: 'SYNC_START'
    room.lastActive = Date.now()
    return room.action
}
