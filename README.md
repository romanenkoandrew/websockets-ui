# RSSchool NodeJS websocket task template
> Static http server and base task packages. 
> By default WebSocket client tries to connect to the 3000 port.

## Installation
1. Clone/download repo
2. `npm install`

## Usage
**Development**

`npm run start:dev`

* App served @ `http://localhost:8181` with nodemon

**Production**

`npm run start`

* App served @ `http://localhost:8181` without nodemon

---

**All commands**

Command | Description
--- | ---
`npm run start:dev` | App served @ `http://localhost:8181` with nodemon
`npm run start` | App served @ `http://localhost:8181` without nodemon

**Note**: replace `npm` with `yarn` in `package.json` if you use yarn.

### Login Rules
- Each user can log in only once at a time.

- If a second login attempt is made with the same credentials, an error message will be returned.

### Room Creation & Participation
- A user can create a room and is automatically added to that room.

- A user can be a member of only one room at a time.

- If a user creates a room, they cannot be invited to that room or to any other room.

### Real-Time Synchronization
- Room list and winners table are automatically synchronized and broadcast to all online users in real-time.
