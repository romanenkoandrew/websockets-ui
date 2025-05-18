import { getOnlineUsers } from "../db/users"
import { WebSocket } from 'ws'

export const broadcastToAllUsers = (message: any, excludeSocket?: WebSocket) => {
    const payload = typeof message === 'string' ? message : JSON.stringify(message)
  
    for (const [ws] of getOnlineUsers().all()) {
      if (ws !== excludeSocket && ws.readyState === ws.OPEN) {
        ws.send(payload)
      }
    }
  }