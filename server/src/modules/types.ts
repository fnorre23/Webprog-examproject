
// TYPES ////////////////////////////////////////
// Enum alternative
const Phase = {
    LOBBY: 'lobby',
    PLAYING: 'playing',
    SPECTATING: 'spectating',
} as const;

// TODO: Hvorfor er det saadan her?
export type Phase = (typeof Phase)[keyof typeof Phase];

const PlayerPhase = {
    LOBBY: 'lobby',
    PLAYING: 'playing',
    SPECTATING: 'spectating',
} as const;

export type PlayerPhase = (typeof PlayerPhase)[keyof typeof PlayerPhase];
export interface State {
    phase: Phase,
    players: Record<string, Player>,
    timer: ReturnType<typeof setTimeout> | null,
}



// State Data Transfer Object - Det er vores sanitized state, saa vi ved at client kun faar det de skal bruge
export interface StateDTO {
    phase: Phase,
    players: Record<string, SanitizedPlayer>,
}

export interface Player {
    socket_id: string,
    name: string,
    guesses: Guess[] | null,
    placement: number | null,
    has_won_round: boolean
    has_lost: boolean,
    is_ready: boolean,
}

export interface SanitizedPlayer {
    name: string,
    guesses: SanitizedGuess[],
    has_lost: boolean,
}

export interface Guess {
    guess: string,
    was_correct: boolean,
    is_valid: boolean,
    character_info: [
        {
            char: string,
            in_word: boolean,
            correct_idx: boolean,
        },
        {
            char: string,
            in_word: boolean,
            correct_idx: boolean,
        },
        {
            char: string,
            in_word: boolean,
            correct_idx: boolean,
        },
        {
            char: string,
            in_word: boolean,
            correct_idx: boolean,
        },
        {
            char: string,
            in_word: boolean,
            correct_idx: boolean,
        },
    ]
}

// TODO: Omskriv til at vaere en derived type fra Guess
export interface SanitizedGuess {
    character_info: [
        {
            //char1: string,
            in_word: boolean,
            correct_idx: boolean,
        },
        {
            //char2: string,
            in_word: boolean,
            correct_idx: boolean,
        },
        {
            //char3: string,
            in_word: boolean,
            correct_idx: boolean,
        },
        {
            //char4: string,
            in_word: boolean,
            correct_idx: boolean,
        },
        {
            //char5: string,
            in_word: boolean,
            correct_idx: boolean,
        },
    ]
}

