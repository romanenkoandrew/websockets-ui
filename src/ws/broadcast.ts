import { getGameById, playerIdResolver } from "../db/games"
import { getOnlineUsers, getSocketByUser } from "../db/users"
import { WebSocket } from 'ws'

export const broadcastToAllUsers = (message: any, excludeSocket?: WebSocket) => {
    const data = typeof message === 'string' ? message : JSON.stringify(message)
  
    for (const [ws] of getOnlineUsers().all()) {
      if (ws !== excludeSocket && ws.readyState === ws.OPEN) {
        ws.send(data)
      }
    }
}

type PlayerMessages = {
    [playerIndex: string]: any
}
  
export const broadcastToGamePlayers = (
    gameId: string,
    messages: PlayerMessages
  ) => {
    const game = getGameById(gameId)
    if (!game) return

    game.players.forEach(player => {
      const userId = playerIdResolver(player.idPlayer)
      const ws = getSocketByUser(userId)
  
      if (ws && ws.readyState === WebSocket.OPEN) {
        const message = messages[player.idPlayer]
        const payload = typeof message === 'string' ? message : JSON.stringify(message)

        if (payload) {
            ws.send(payload)
        }
      }
    })
}
  