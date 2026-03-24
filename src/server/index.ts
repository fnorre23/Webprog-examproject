import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';

const app = express();
const server = http.createServer(app);

const io = new Server(server);

const state = { 
    phase: 'lobby',
    players: {},
    timer: null
}

io.on('connection', (socket: Socket) => {
    console.log('+ connected [${socket.id}]');

    socket.emit('state', sanitize(state));

    socket.on('join', (name: string) => {
        state.players[socket.id] = {
            name: name.trim().slice(0,) || 'Player',
            ready: true,
            score: null,
            phase: 'lobby'
