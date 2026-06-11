
// TYPES ////////////////////////////////////////
// Enum alternative
const PHASE = {
    LOBBY: 'lobby',
    PLAYING: 'playing',
} as const;

export type Phase = (typeof PHASE)[keyof typeof PHASE];

export { PHASE };

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
    current_round_time_left: number | null,
    has_lost: boolean,
    is_ready: boolean,
    has_won_round: boolean,
    has_lost_round: boolean,
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

export interface SanitizedGuess {
    character_info:
    {
        char: string,
        in_word: boolean,
        correct_idx: boolean,
    }[]
}
