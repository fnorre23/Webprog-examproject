import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';

const app = express();
const server = http.createServer(app);

const io = new Server(server);

interface Player {
    name: string;
    ready: boolean;
    score: number | null;
    status: PlayerStatus;
}

enum PlayerStatus {
    NotReady = 'notReady',
    Ready = 'ready',
    Active = 'active',
    Spectator = 'spectator'
}

const state = { 
    phase: 'lobby',
    players: {} as Record<string, Player>,
    timer: null
}

app.use(express.static('client'));

io.on('connection', (socket: Socket) => {
    console.log(`+ connected [${socket.id}]`);

    socket.emit('state', (state));

    socket.on('join', (name: string) => {
        state.players[socket.id] = {
            name: name.trim().slice(0, 16) || 'Player',
            ready: true,
            score: null,
            status: PlayerStatus.NotReady
        };
    });
});


const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  game running`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Network: http://<your-ip>:${PORT}\n`);
  console.log(`  Lobby → /lobby.html`)
});