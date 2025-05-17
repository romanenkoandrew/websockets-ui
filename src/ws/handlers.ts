import { Message, RegData } from './types';
import { WebSocket } from 'ws';
import { loginByCredentials } from '../db/users';

export function handleMessage(ws: WebSocket, msg: Message): any {
    switch (msg.type) {
        case 'reg': {
            const data: RegData = JSON.parse(msg.data)
            const { name, password } = data;
            const result = loginByCredentials(ws, name, password);
            
            return JSON.stringify(result)
        }

        default:
            return { type: 'error', data: 'Unknown message type', id: 0 };
    }
}
