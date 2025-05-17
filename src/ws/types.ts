export type Message = 'reg' | 'update_winners' | 'unknown'

export type IncomingMessage = { type: Message; data: string, id: number }

export type RegData = { name: string; password: string }

export type MessageResponse = {
  type: Message;
  data: string;
  id: number
};
