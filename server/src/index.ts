// TODO: send answers back 

/* csv shit https://csv.js.org/parse/examples/async_iterator/ */
import { checkGuess } from './modules/wordle.ts';
import { Server } from 'socket.io';
import http from 'http';

// Server setup https://www.geeksforgeeks.org/node-js/how-to-create-a-simple-server-using-express-js/
import express from "express";

// Server setup
const app = express();
const PORT: number = 8080;

const server = http.createServer(app);

// IO haandterer websockets, og derfinerer derfor selv CORS shit
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: [
            'GET',
            'POST',
            // 'PUT',
            // 'DELETE',
        ],
        allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
        ]
    }
});

// Parse requests
app.use(express.text());

// CORS related fra Express til almene HTTP methods
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With,Content-Type, Accept');
    next();
});

// testing requests
app.get('/', (req, res) => {
    res.send('<h1>Hello, Geeks!</h1><p>This is your simple Express server.</p>');
});

app.post('/', (req, res) => {
    let jsonResponse = checkGuess(req.body);
    res.send(jsonResponse);
})

server.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
});

checkGuess('beans');



// Enum alternative
const Phase = {
    LOBBY: 'lobby',
    PLAYING: 'playing',
    SPECTATING: 'spectating',
    RESULTS: 'results',
} as const;

type Phase = (typeof Phase)[keyof typeof Phase];

let phase: Phase = 'lobby';

interface State {
    phase: Phase,
    players: object,
    timer: ReturnType<typeof setTimeout> | null,
}

const state: State = {
    phase: phase,
    players: {},                // { socketId: { name, reactionTime, ready } }
    timer: null,                // reference to the countdown setTimeout
}

io.on('connection', (socket) => {
    console.log('Socket ID just joined: ' + socket.id);
})


// Import til at skrive via cli for debugging
// import * as readline from 'node:readline/promises';
// import { stdin as input, stdout as output } from 'node:process';
// import fs from 'fs';

/* DEBUGGING IN THE CLI */
// const rl = readline.createInterface({ input, output });
// const guess: string = await rl.question('Guess a word: ');
// rl.close();
//
// let api_response = checkGuess(guess);
//
// fs.writeFile('guess.json', api_response, (err) => {
//     if (err) {
//         console.log('Error writing file:', err);
//     } else {
//         console.log('Successfully wrote file');
//     }
// });
