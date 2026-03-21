document.addEventListener("DOMContentLoaded", loadPage);

type KeyboardLetter = {
    char: string,
    isInWord: boolean,
    isCorrect: boolean
}

type Word = {
    letter1: KeyboardLetter,
    letter2: KeyboardLetter,
    letter3: KeyboardLetter,
    letter4: KeyboardLetter,
    letter5: KeyboardLetter,
    isGuessed: boolean,
    isCorrect: boolean
}

function loadPage() {
    document.addEventListener('keydown', typeLetter);
}

const enum keys { BACKSPACE = 8, ENTER = 13, }

const wordContainers: HTMLCollection = document.getElementsByClassName("wordContainer");
let currentChar: number = 0;
let currentGuess: number = 0;

function typeLetter(event: KeyboardEvent): void {
    const ascii_key: number = event.keyCode;
    const char: string = String.fromCharCode(ascii_key);
    const wordContainer: Element | undefined = wordContainers[currentGuess];
    let currentCharBox: Element | undefined = wordContainer.children[currentChar];

    // Hvis vi trykker backspace saa sletter vi bogstaveti boksen, hvis boksen er tom, gaar vi lige en boks tilbage for at slette.
    if (ascii_key == keys.BACKSPACE) {
        console.log("Backspace!");

        if (currentChar == 5) {
            currentChar--;
            currentCharBox = wordContainer.children[currentChar];
        }

        if (wordContainer != undefined && currentCharBox != undefined) {

            if (currentCharBox.textContent == "" && currentChar > 0) {
                currentChar--;
                currentCharBox = wordContainer.children[currentChar];
            }

            currentCharBox.textContent = "";

            if (currentChar > 0) {
                currentChar--;
            }

            console.log("Current char num: " + currentChar);
        }

        // Hvis vi trykker enter, og hele ordet er fyldt ud, gaetter vi
    } else if (ascii_key == keys.ENTER) {

        console.log('Enter!');

        if (currentChar == 5) {
            guessWord();
        }

        else {
            console.log('Gotta type all 4 letters to guess a word!')
        }

        // Hvis det er et bogstav og vi ikke er paa sidste bogstav maa vi godt skrive
    } else if (isLetter(char) && currentChar <= 5) {
        console.log('Registered keypress: ' + char);

        if (wordContainer != undefined && currentCharBox != undefined) {

            if (currentCharBox.textContent != "" && currentChar >= 0 && currentChar <= 4) {
                currentChar++;
                currentCharBox = wordContainer.children[currentChar];
                currentCharBox.textContent = char;

            } else if (currentCharBox.textContent == "" && currentChar >= 0 && currentChar <= 4) {
                currentCharBox.textContent = char;
                currentChar++;
            }

            console.log("Current char num: " + currentChar);
        }

    } else {
        console.log('Invalid key');
    }
}

function checkWord(word: Array<string>) {
    for (let i: number = 0; i < word.length; i++) {

    }
}

function guessWord() {
    console.log('Guessed a word!');
    currentGuess++;
    currentChar = 0;
}

// Source - https://stackoverflow.com/a/9862788
// Posted by JaredPar
// Retrieved 2026-03-21, License - CC BY-SA 3.0
function isLetter(str: string): boolean {
    if (str.length === 1 && str.match(/[a-z]/i)) {
        return true;
    } else {
        return false;
    }
}
