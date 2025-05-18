import { getGameById, Player, playerIdResolver } from "../db/games"
import { getOnlineUsers, getSocketByUser } from "../db/users"
import { WebSocket } from 'ws'
import { mapToResponse } from "./utils"
import { Message } from "./types"

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

export const sendToPlayers = (
    gameId: string,
    players: { idPlayer: string; [key: string]: any }[],
    type: Message,
    extraDataFn: (player: Player) => object = () => ({}),
    additionalData?: Record<string, string>
  ) => {
    const messages = players.reduce((acc, player) => {
      acc[player.idPlayer] = mapToResponse(
        type,
        JSON.stringify({ idGame: gameId, idPlayer: player.idPlayer, ...extraDataFn(player), ...additionalData })
      )
      return acc
    }, {} as Record<string, any>)
  
    broadcastToGamePlayers(gameId, messages)
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
  