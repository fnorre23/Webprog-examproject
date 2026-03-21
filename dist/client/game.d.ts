type KeyboardLetter = {
    char: string;
    isInWord: boolean;
    isCorrect: boolean;
};
type Word = {
    letter1: KeyboardLetter;
    letter2: KeyboardLetter;
    letter3: KeyboardLetter;
    letter4: KeyboardLetter;
    letter5: KeyboardLetter;
    isGuessed: boolean;
    isCorrect: boolean;
};
declare function loadPage(): void;
declare const enum keys {
    BACKSPACE = 8,
    ENTER = 13
}
declare const wordContainers: HTMLCollection;
declare let currentChar: number;
declare let currentGuess: number;
declare function typeLetter(event: KeyboardEvent): void;
declare function checkWord(word: Array<string>): void;
declare function guessWord(): void;
declare function isLetter(str: string): boolean;
//# sourceMappingURL=game.d.ts.map