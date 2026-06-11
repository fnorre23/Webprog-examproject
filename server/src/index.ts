import { Server } from 'socket.io';
import http from 'http';
import express from "express"; // Server setup https://www.geeksforgeeks.org/node-js/how-to-create-a-simple-server-using-express-js/
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import type { Player, State, Phase, SanitizedGuess, StateDTO } from './modules/types.ts';
import { checkGuess, setNewCorrectWord } from './modules/wordle.ts';
import { PHASE } from './modules/types.ts';

// Server setup
const app = express();
const PORT: number = 8080;
const server = http.createServer(app);
const io = new Server(server, {}); // IO haandterer websockets, og definerer derfor selv CORS


// Setup til at serve vores flutter build
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.text());
app.use(express.static(join(__dirname, '../../client/build/web')));

server.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
});

// GLOBAL STATE ////////////////

let phase: Phase = PHASE.LOBBY;

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
            name: name.trim() || 'Anonymous Player',
            has_won_round: false,
            guesses: [],
            placement: 0,
            has_lost: false,
            has_lost_round: false,
            is_ready: false,
            current_round_time_left: 0,
        }

        console.log(`Player ${global_state.players[socket.id].name} joined the lobby`);

        // Hvis de joiner en eksisterende lobby, saa har de allerede tabt
        if (global_state.phase == PHASE.PLAYING) {
            global_state.players[socket.id].has_lost = true;
        }

        io.emit('state', sanitize_global_state())
    });

    socket.on('ready_up', () => {
        const player = global_state.players[socket.id];

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

        global_state.phase = PHASE.PLAYING;
        nextRound();
        io.emit('state', sanitize_global_state());
    });

    socket.on('unready', () => {
        const player = global_state.players[socket.id];
        if (player === undefined || player === null) {
            console.log("Rogue mf proever at vaere med");
            return;
        }
        player.is_ready = false;
        global_state.phase = PHASE.LOBBY;
        io.emit('state', sanitize_global_state());
    })

    socket.on('guess', (data) => {

        const player = global_state.players[socket.id]

        if (player === undefined || player === null) {
            console.log("Rogue mf proever at vaere med");
            return;
        }

        if (player.has_lost == true) {
            return;
        }

        let guess = data['guess'];
        const time_left = data['time_left'];

        if (typeof guess !== "string") {
            console.log("not a string!");
            console.log(guess)
            return;
        }

        guess = guess.toLowerCase();

        console.log(`Received guess: ${guess} from ${player.name}`);

        const processedGuess = checkGuess(guess)

        // Hvis det ikke er validt, saa stoppper vi med det samme og sender bare tilbage. 
        // Ingen state opdatering, da kun spilleren skal vide de ikke kan gaette det
        if (!processedGuess.is_valid) {
            socket.emit('guess_validation', processedGuess);
            return;
        }

        // Alt herefter antager at guess er valid

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

        socket.emit('guess_validation', processedGuess);
        io.emit('state', sanitize_global_state());

        // Tjekker om alle har svaret
        for (const player of getActivePlayers()) {
            if (!player.has_won_round) {
                if (player.has_lost_round) {
                    continue;
                }
                return;
            }
        }

        // Hvis vi når hertil, skal vi til naeste runde
        nextRound();
        io.emit('next_round')
        io.emit('state', sanitize_global_state());

    });

    socket.on('timed_out', () => {
        const player = global_state.players[socket.id];

        if (player === undefined || player === null) {
            console.log("Rogue mf proever at vaere med");
            return;
        }

        console.log(`${player.name} timed out! Time to fuck all`)

        for (const player of getActivePlayers()) {
            if (!player.has_won_round) {
                player.has_lost_round = true;
                console.log(`${player.name} lost round due to timing out`);
                io.to(player.socket_id).emit('lost_timeout');
            }
        }

        nextRound();
        io.emit('next_round')
        io.emit('state', sanitize_global_state());
    })

    socket.on('disconnect', () => {
        console.log(`Socket ID ${socket.id} disconnected`);

        if (global_state.players[socket.id] !== null)
            delete global_state.players[socket.id];

        // Hvis der ikke er nogen aktive spillere tilbage, saa skal vi bare til lobby
        if (getActivePlayers().length === 0) {
            global_state.phase = PHASE.LOBBY;
            io.emit('state', sanitize_global_state());
        }

        io.emit('active_players_disconnected');
        io.emit('state', sanitize_global_state());
    });

});

// Clean up til naeste runde + vi sender til alle at det er naeste runde
function nextRound() {

    let active_players = getActivePlayers();

    // Hvis spillere er over midpoint, saa skal de tabe, 
    // da en stoerre plads er skidt. 1 er bedst, 100 er vaerst
    //
    // Vi soerger for at midpoint altid er et ulige tal,
    // saa vi har en lige maengde mennesker tilbage til naeste runde
    //
    // Paa skala, soerger vi for der altid kun er 2 i finalen

    let midpoint_placement = Math.round(active_players.length / 2);
    if (midpoint_placement % 2 === 1) midpoint_placement++;

    // Edge case, kun 2 spillere tilbage
    if (active_players.length === 2) {
        midpoint_placement = 1;
    }

    for (const player of active_players) {

        if (player.has_lost_round) {
            player.has_lost = true;
        }

        //console.log(`Midpoint for this round: ${midpoint_placement}`);

        // Hvis de er i bottom half, har de tabt. 
        // Vi tjekker for 0, da foerste runde starter de alle paa 0
        // Resetter ogsaa deres stats, saa de ikke viser sig for de andre
        if (player.placement! > midpoint_placement && player.placement != 0) {
            console.log(`${player.name} lost this round because they were worse`);
            player.has_lost = true;
            player.guesses = [];
            if (player.has_won_round)
                io.to(player.socket_id).emit('lost_since_worse');
            continue;
        }

        // Resetter deres status
        player.has_won_round = false;
        player.has_lost_round = false;
        player.guesses = [];
    }

    // Filtrerer dem der lige har tabt fra, i stedet for at kalde
    // getActivePlayers igen
    active_players = active_players.filter(player => !player.has_lost);

    // Hvis der kun er en spiller tilbage, så tjekker vi vinder og resetter
    // Uanset hvad, så hvis der kun er 1 spiller skal vi starte forfra
    if (active_players.length <= 1) {
        checkWinner();

        // Resets for next round
        for (const player of getPlayers()) {
            player.has_lost = false
        }
        io.emit('state', sanitize_global_state());
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
    return getPlayers().filter((player: Player) => !player.has_lost);
}

function checkWinner() {
    const winner = getActivePlayers()[0];

    if (winner === undefined) {
        console.log('Idfk, noget weird er sket');
        global_state.phase = PHASE.LOBBY;
        io.emit('state', sanitize_global_state());
        return;
    }

    if (winner.has_lost) {

        console.log("No winner this round...");

        io.emit('game_over_no_winner', winner.name);
        global_state.phase = PHASE.LOBBY;
        io.emit('state', sanitize_global_state());
        return;
    }


    // Mest til debug naar man er 1 spiller og skal proeve en runde
    // burde ikke vaere relevant i et rigtigt use case
    if (winner.placement === 0) {
        console.log('a little early to have won!')
    } else {
        console.log(`The winner is: ${winner.name}`);

        io.emit('game_over', winner.name)
        global_state.phase = PHASE.LOBBY;
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

    const active_players = getActivePlayers();

    for (const player of active_players) {
        temp_placements[player.name] = player.placement;
    }

    for (const opponent of active_players) {

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

    for (const player of active_players) {
        player.placement = temp_placements[player.name];
    }
}

// Sanitizer global state til kun den info som brugerne skal bruge
function sanitize_global_state(): StateDTO {

    // Clear last state

    sanitized_state.players = {};

    for (const player of getPlayers()) {

        let sanitized_guesses: SanitizedGuess[] = [];

        // Fik hjaelp med at forstaa map() fra claude her
        sanitized_guesses = player.guesses!.map((guess) => ({
            character_info: guess.character_info.map(({ char, correct_idx, in_word }) => ({
                char,
                correct_idx,
                in_word,
            }))
        }));

        sanitized_state.players[player.socket_id] = {
            name: player.name,
            guesses: sanitized_guesses,
            has_lost: player.has_lost
        }


    };

    sanitized_state.phase = global_state.phase;

    return sanitized_state;
}
