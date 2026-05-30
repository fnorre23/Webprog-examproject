/* csv shit https://csv.js.org/parse/examples/async_iterator/ */
import { checkGuess, setNewCorrectWord } from './modules/wordle.ts';
import { Server } from 'socket.io';
import http from 'http';
import type { Player, State, Phase, SanitizedGuess, SanitizedPlayer, StateDTO } from './modules/types.ts';

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

// CORS settings til almene HTTP methods
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With,Content-Type, Accept');
    next();
});

//testing requests
app.get('/', (req, res) => {
    res.send('<h1>Hello, Geeks!</h1><p>This is your simple Express server.</p>');
});

// app.post('/', (req, res) => {
//     let jsonResponse = checkGuess(req.body);
//     res.send(jsonResponse);
// })

server.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
});



// GLOBAL STATES ////////////////

let phase: Phase = 'lobby';

const global_state: State = {
    phase: phase,
    players: {},                // { socketId: { name, reactionTime, ready } }
    timer: null,                // reference to the countdown setTimeout
};

let placement_counter = 1;
const MIN_PLAYERS = 2;

const sanitized_state: StateDTO = {
    phase: phase,
    players: {},
};

/////////////////////////////////

io.on('connection', (socket) => {

    console.log(`Socket ID ${socket.id} just joined`);

    socket.emit('state', sanitize_global_state());

    // Initializing en player naar de joiner
    socket.on('join', (name) => {
        global_state.players[socket.id] = {
            socket_id: socket.id,
            name: name.trim() || 'Player',
            current_guess: null,
            guesses: [],
            placement: null,
            has_lost: false,
            is_ready: false,
        }

        console.log(`Player ${global_state.players[socket.id].name} joined the lobby with a name`);

        // Hvis de joiner en eksisterende lobby, saa har de allerede tabt
        if (global_state.phase == 'playing') {
            global_state.players[socket.id].has_lost = true;
        }

        io.emit('state', sanitize_global_state())

    });

    // Tager ikke hoejde for antallet af spillere i lobbyen
    socket.on('ready_up', () => {
        let player = global_state.players[socket.id];
        player.is_ready = true;

        if (getPlayerTotal() < MIN_PLAYERS) return;

        for (const player of getPlayers()) {
            if (!player.is_ready) {
                return;
            }
        }

        global_state.phase = 'playing';
        io.emit('state', sanitize_global_state());
        nextRound();
    });

    socket.on('guess', (guess) => {

        let player = global_state.players[socket.id]
        if (player.has_lost == true) {
            return;
        }

        player.current_guess = guess;
        player.guesses!.push(guess);

        let jsonResponse, guessed_correct = checkGuess(guess)

        if (guessed_correct) {
            player.placement = placement_counter;
            placement_counter++;
        }

        if (!guessed_correct && player.guesses!.length >= 6) {
            player.has_lost = true;
        }

        // Sender svar tilbage
        socket.emit('guess_validation', JSON.stringify(jsonResponse));

        // TODO: Send player state

        // Update info for alle
        io.emit('state', sanitize_global_state());

        // Tjekker om alle har svaret
        for (const player of getPlayers()) {
            if (player.current_guess == null) {
                return;
            }
        }

        // HVIS VI NAAR HER, SKAL VI TIL NAESTE RUNDE
        nextRound();

    });

    socket.on('disconnect', () => {
        console.log(`Socket ID ${socket.id} left`);
    });

});

// Clean up til naeste runde + vi sender til alle at det er naeste runde
function nextRound() {
    for (let player of getPlayers()) {

        // Hvis de er i bottom half, har de tabt. Vi tjekker for 0, da foerste runde starter de alle paa 0
        // TODO: Fiks til at holde styr paa aktive spillere
        if (player.placement! < (Math.round(getPlayerTotal())) / 2
            && player.placement != 0) {

            player.has_lost = true;
            continue;
        }

        // Resetter deres gaet
        player.current_guess = null;
    }

    setNewCorrectWord();

    io.emit('next_round');
    io.emit('state', sanitize_global_state());
}

// Helpers //////////////////////////////////////////

function getPlayers(): Player[] {
    return Object.values(global_state.players);
}

function getPlayerTotal() {
    return Object.keys(global_state.players).length;
}

// Sanitizer global state til kun den info som brugerne skal bruge
function sanitize_global_state(): StateDTO {

    for (const player of getPlayers()) {
        if (player.guesses == null) {
            continue
        }

        // Virkelig cursed overfoersel af guesses til sanitized guesses.
        // Kunne vaere at global sanitized state bare skulle opdateres hver gang global state opdateres med player guesses, but fuck it i guess. Nu er vi eksplicitte
        let sanitized_guesses: SanitizedGuess[] = [];
        for (let i = 0; i < player.guesses.length; i++) {
            sanitized_guesses[i] = {
                // TODO: .map() i stedet for hardcoding
                character_info: [
                    {
                        //char1: player.guesses[i].character_info[0].char1,
                        in_word: player.guesses[i].character_info[0].in_word,
                        correct_idx: player.guesses[i].character_info[0].correct_idx,
                    },

                    {
                        //char2: player.guesses[i].character_info[1].char2,
                        in_word: player.guesses[i].character_info[1].in_word,
                        correct_idx: player.guesses[i].character_info[1].correct_idx,
                    },

                    {
                        //char3: player.guesses[i].character_info[2].char3,
                        in_word: player.guesses[i].character_info[2].in_word,
                        correct_idx: player.guesses[i].character_info[2].correct_idx,
                    },

                    {
                        //char4: player.guesses[i].character_info[3].char4,
                        in_word: player.guesses[i].character_info[3].in_word,
                        correct_idx: player.guesses[i].character_info[3].correct_idx,
                    },
                    {
                        //char5: player.guesses[i].character_info[4].char5,
                        in_word: player.guesses[i].character_info[4].in_word,
                        correct_idx: player.guesses[i].character_info[4].correct_idx,
                    }

                ]
            }
        };

        sanitized_state.players[player.socket_id] = {
            name: player.name,
            guesses: sanitized_guesses,
            has_lost: player.has_lost
        }

    };

    return sanitized_state;
}






////////////////////////////////////////////////////

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
///     }
// });
