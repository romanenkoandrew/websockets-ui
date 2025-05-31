import { getGameById, playerIdResolver } from "../db/games"
import { getOnlineUsers, getSocketByUser } from "../db/users"
import { WebSocket } from 'ws'
import { mapToResponse } from "./utils"
import { Message, Player } from "./types"

export const broadcastToAllUsers = (message: any, excludeSocket?: WebSocket) => {
    const data = typeof message === 'string' ? message : JSON.stringify(message)
  
    console.log('Send message to all online users:', message)

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
  ) => {
    const messages = players.reduce((acc, player) => {
      acc[player.idPlayer] = mapToResponse(
        type,
        JSON.stringify({ idGame: gameId, idPlayer: player.idPlayer, ...extraDataFn(player) })
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

    game.players.forEach((player, index) => {
      const userId = playerIdResolver(player.idPlayer)
      const ws = getSocketByUser(userId)
  
      if (ws && ws.readyState === WebSocket.OPEN) {
        const message = messages[player.idPlayer]
        const payload = typeof message === 'string' ? message : JSON.stringify(message)

        if (payload) {
            console.log(`Send message to game player №${index + 1}:`, message)
            ws.send(payload)
        }
      }
    })
}
  