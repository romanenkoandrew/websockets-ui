export type Message =
  | { type: 'reg'; data: string, id: number }
  | { type: 'echo'; data: string };

export type RegData = { name: string; password: string }

export type MessageResponse = {
  type: string;
  data: string;
  id: number
};
