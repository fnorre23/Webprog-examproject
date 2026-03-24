
export type KeyboardLetter = {
    char: string,
    isInWord: boolean,
    isCorrect: boolean
}

export type Word = {
    letter1: KeyboardLetter,
    letter2: KeyboardLetter,
    letter3: KeyboardLetter,
    letter4: KeyboardLetter,
    letter5: KeyboardLetter,
    isGuessed: boolean,
    isCorrect: boolean
}
