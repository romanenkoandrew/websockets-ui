import { WebSocketServer } from 'ws'
import { IncomingMessage } from './types'
import { handleMessage } from './handlers'
import { logout } from '../db/users'
import { removeRoomHandler } from './handlers/rooms'


export const createWSS = (port: number) => {
    const wss = new WebSocketServer({ port })

    wss.on('listening', () => console.log(`WebSocketServer listening port ${port}...`))

    wss.on('connection', (ws) => {
        console.log('New WebSocket connection')

        ws.on('message', (message) => {
            try {
                const msg: IncomingMessage = JSON.parse(message.toString())
                console.log('Incoming message:', msg)
                const responses = handleMessage(ws, msg)
                console.log('Response:', responses)

                responses.forEach(response => ws.send(JSON.stringify(response)))
            } catch (err) {
                const msg: IncomingMessage = JSON.parse(message.toString())
                ws.send(JSON.stringify({ type: msg.type, data: JSON.stringify(`Invalid message format, ${err}`), id: 0 }));
            }
        })

        ws.on('close', () => {
            console.log('WebSocket connection closed')
            removeRoomHandler(ws)
            logout(ws)
        })

        ws.on('error', () => {
            ws.send(JSON.stringify({ type: 'unknown', data: JSON.stringify('Websocket error'), id: 0 }));
        })
    })
}