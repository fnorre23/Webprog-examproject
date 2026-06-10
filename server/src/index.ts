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

// IO haandterer websockets, og definerer derfor selv CORS shit
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
// TODO: skal måske slettes
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



// GLOBAL STATE ////////////////

let phase: Phase = 'lobby';

const global_state: State = {
    phase: phase,
    players: {},                // { socketId: { name, reactionTime, ready } }
    timer: null,                // reference to the countdown setTimeout
};

let placement_counter = 1;
const MIN_PLAYERS = 1;

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
            has_won_round: false,
            guesses: [],
            placement: 0,
            has_lost: false,
            is_ready: false,
            current_round_time_left: 0,
        }

        console.log(`Player ${global_state.players[socket.id].name} joined the lobby with a name`);

        // Hvis de joiner en eksisterende lobby, saa har de allerede tabt
        if (global_state.phase == 'playing') {
            global_state.players[socket.id].has_lost = true;
        }

        io.emit('state', sanitize_global_state())

    });

    socket.on('ready_up', () => {
        let player = global_state.players[socket.id];
        if (player === undefined || player === null) {
            console.log("Rogue mf proever at vaere med");
            return;
        }

        player.is_ready = true;

        if (getPlayerTotal() < MIN_PLAYERS) return;

        for (const player of getPlayers()) {
            if (!player.is_ready) {
                return;
            }
        }

        global_state.phase = 'playing';
        nextRound();
        io.emit('state', sanitize_global_state());
    });

    socket.on('unready', () => {
        let player = global_state.players[socket.id];
        if (player === undefined || player === null) {
            console.log("Rogue mf proever at vaere med");
            return;
        }
        player.is_ready = false;
        global_state.phase = 'lobby';
        io.emit('state', sanitize_global_state());
    })

    socket.on('guess', (data) => {

        let guess = data['guess'];
        const time_left = data['time_left'];

        if (typeof guess !== "string") {
            console.log("not a string!");
            console.log(guess)
            return;
        }

        let player = global_state.players[socket.id]
        guess = guess.toLowerCase();

        if (player === undefined || player === null) {
            console.log("Rogue mf proever at vaere med");
            return;
        }

        if (player.has_lost == true) {
            return;
        }

        console.log(`Received guess: ${guess} from ${player.name}`);

        const processedGuess = checkGuess(guess)

        player.guesses!.push(processedGuess);

        if (processedGuess.was_correct) {
            player.has_won_round = true;
            player.current_round_time_left = time_left;
            player.placement = placement_counter;
            placement_counter++;

            updatePlacements(player);

        }

        if (!processedGuess.was_correct && player.guesses!.length >= 6) {
            player.has_lost_round = true;
            console.log(`${player.name} lost the round due to incorrect guesses`);
            socket.emit('lost_incorrect_guesses');
        }

        // Sender svar tilbage
        socket.emit('guess_validation', processedGuess);

        // Update info for alle
        io.emit('state', sanitize_global_state());

        // Tjekker om alle har svaret
        for (const player of getActivePlayers()) {
            if (!player.has_won_round) {
                if (player.has_lost_round) {
                    continue;
                }

                //console.log(`${player.name} has not won round, but they are not out yet! We continue playing`);
                return;
            }
        }

        // Hvis vi når hertil, skal vi til naeste runde
        nextRound();
        io.emit('next_round')
        io.emit('state', sanitize_global_state());

    });

    socket.on('timed_out', () => {
        let player = global_state.players[socket.id];
        player.has_lost_round = true;
        console.log(`${player.name} lost round due to timing out`);
        socket.emit('lost_timeout');
    })

    socket.on('disconnect', () => {
        console.log(`Socket ID ${socket.id} disconnected`);

        if (global_state.players[socket.id] !== null)
            delete global_state.players[socket.id];

        io.emit('state', sanitize_global_state());
    });

});

// Clean up til naeste runde + vi sender til alle at det er naeste runde
function nextRound() {

    // Hvis spillere er over midpoint, saa skal de tabe, 
    // da en stoerre plads er skidt. 1 er bedst, 100 er vaerst
    //
    // Vi soerger for at midpoint altid er et ulige tal,
    // saa vi har en lige maengde mennesker tilbage til naeste runde
    //
    // Paa skala, soerger vi for der altid kun er 2 i finalen
    let midpoint_placement = Math.round(getActivePlayersTotal()) / 2
    if (midpoint_placement % 2 === 1) midpoint_placement++;

    // Edge case, kun 2 spillere tilbage
    if (getActivePlayersTotal() === 2) {
        midpoint_placement = 1;
    }

    for (const player of getActivePlayers()) {

        if (player.has_lost_round) {
            player.has_lost = true;
        }

        //console.log(`Midpoint for this round: ${midpoint_placement}`);

        // Hvis de er i bottom half, har de tabt. 
        // Vi tjekker for 0, da foerste runde starter de alle paa 0
        if (player.placement! > midpoint_placement && player.placement != 0) {
            console.log(`${player.name} lost this round because they were worse`);
            player.has_lost = true;
            player.guesses = [];
            continue;
        }

        // Resetter deres status
        player.has_won_round = false;
        player.has_lost_round = false;
        player.guesses = [];
    }

    if (getActivePlayersTotal() < 2) {
        checkWinner();
        return;
    }

    // Resetter ord og placement counter til ny runde
    setNewCorrectWord();
    placement_counter = 1;
}

// Helpers //////////////////////////////////////////

function getPlayers(): Player[] {
    return Object.values(global_state.players);
}

function getPlayerTotal() {
    return Object.keys(global_state.players).length;
}

function getActivePlayers() {

    const players = getPlayers();

    let active_players = [];

    for (const player of players) {
        // console.log(`Player ${player.name} has lost? ${player.has_lost}`);
        if (!player.has_lost) {
            active_players.push(player);
        }
    }
    return active_players;
}

function getActivePlayersTotal() {
    const active_players = getActivePlayers();
    return active_players.length;
}

function checkWinner() {
    const winner = getActivePlayers()[0];

    // Mest til debug naar man er 1 spiller og skal proeve en runde
    // burde ikke vaere relevant i et rigtigt use case
    if (winner.placement === 0) {

        console.log('a little early to have won!')

    } else if (winner.has_lost) {

        console.log("No winner this round...");

        io.emit('game_over_no_winner', winner.name);
        global_state.phase = 'lobby';
        io.emit('state', sanitize_global_state());

    } else {
        console.log(`The winner is: ${winner.name}`);

        io.emit('game_over', winner.name)
        global_state.phase = 'lobby';
        io.emit('state', sanitize_global_state());
    }

    // Resets for next round
    for (const player of getPlayers()) {
        player.has_lost = false
    }
}

/**
* Creates a temp object for player placements, and then compares
* placements and times, and swaps the temp according to this. 
* lastly writes back to the player objects with updated placements
* 
* The reason for temp placements, is that if we swap while doing the comparison,
* it might affect the subsequent comparisons negatively.
**/
function updatePlacements(player: Player) {
    let temp_placements: any = {};

    for (const player of getActivePlayers()) {
        temp_placements[player.name] = player.placement;
    }

    for (const opponent of getActivePlayers()) {

        if (player === opponent) continue;

        if (player.guesses!.length === opponent.guesses!.length) {

            if (player.current_round_time_left! < opponent.current_round_time_left!
                && temp_placements[player.name] < temp_placements[opponent.name]) {

                const temp = temp_placements[player.name];
                temp_placements[player.name] = temp_placements[opponent.name];
                temp_placements[opponent.name] = temp;
            }
        }
    }

    for (const player of getActivePlayers()) {
        player.placement = temp_placements[player.name];
    }

    // console.log(`Current placements:`)
    // for (const player of getActivePlayers()) {
    //     console.log(`Player ${player.name} placement ${player.placement}`);
    // }

}

// Sanitizer global state til kun den info som brugerne skal bruge
function sanitize_global_state(): StateDTO {

    for (const player of getPlayers()) {

        if (player.guesses!.length == 0) {
            // console.log(`No guesses yet from ${player.name}`)
            continue;
        }

        // Virkelig cursed overfoersel af guesses til sanitized guesses.
        let sanitized_guesses: SanitizedGuess[] = [];
        for (let i = 0; i < player.guesses!.length; i++) {


            sanitized_guesses[i] = {
                // TODO: .map() i stedet for hardcoding
                character_info: [
                    {
                        in_word: player.guesses![i].character_info[0].in_word,
                        correct_idx: player.guesses![i].character_info[0].correct_idx,
                    },

                    {
                        in_word: player.guesses![i].character_info[1].in_word,
                        correct_idx: player.guesses![i].character_info[1].correct_idx,
                    },

                    {
                        in_word: player.guesses![i].character_info[2].in_word,
                        correct_idx: player.guesses![i].character_info[2].correct_idx,
                    },

                    {
                        in_word: player.guesses![i].character_info[3].in_word,
                        correct_idx: player.guesses![i].character_info[3].correct_idx,
                    },
                    {
                        in_word: player.guesses![i].character_info[4].in_word,
                        correct_idx: player.guesses![i].character_info[4].correct_idx,
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

    sanitized_state.phase = global_state.phase;

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
