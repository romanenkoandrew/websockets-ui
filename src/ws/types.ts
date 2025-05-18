type RoomMessages = 'update_room' | 'create_room' | 'add_user_to_room'
type GameMessages = 'create_game' | 'start_game' | 'add_ships' | 'turn' | 'attack' | 'randomAttack'
export type Message = 'reg' | 'update_winners' | 'unknown' | 'error' | RoomMessages | GameMessages

export type IncomingMessage = { type: Message; data: string, id: number }

export type Player = {
  idPlayer: string
  ships?: Ship[]
  ready?: boolean
}

export type Game = {
  idGame: string
  players: [Player, Player]
  currentPlayer: string
}


export type Position = { x: number; y: number }

export type Ship = {
  position: Position
  direction: boolean
  type: 'huge' | 'large' | 'medium' | 'small'
  length: number
  hits: Position[]
}

export type AttackStatus = 'miss' | 'shot' | 'killed'

export type AttackData = {
  gameId: string
  x: number
  y: number
  indexPlayer: string
}

export type AttackResult = {
  position: Position
  status: AttackStatus
  currentPlayer: string
  players: [Player, Player]
}

export type RegData = { name: string; password: string }
export type AddToRoomData = { indexRoom: string }

export type AddShipsData = {
  gameId: string
  indexPlayer: string
  ships: Ship[]
}

export type MessageResponse = {
  type: Message;
  data: string;
  id: number
}

export type Result = {
  error: boolean
  errorMessage: string
}
