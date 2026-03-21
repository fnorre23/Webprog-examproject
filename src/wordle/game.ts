console.log('Here we go wordlin\''!)

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

let wordContainers: HTMLCollection = document.getElementsByClassName("wordContainer");
let currentChar: number = 0;
let currentGuess: number = 0;

for (let i: number = 0; i < wordContainers.length; i++) {
    let wordContainer: Element | undefined = wordContainers[i];

    if (wordContainer != undefined) {
        for (let j: number = 0; i < 5; i++) {
            let charBox: Element = wordContainer[j];
            charBox.textContent = " ";
        }
    }

}

function typeLetter(event: KeyboardEvent): void {
    let ascii_key: number = event.keyCode;
    let char: string = String.fromCharCode(ascii_key);
    let wordContainer: Element | undefined = wordContainers[currentGuess];
    let currentCharBox: Element | undefined = wordContainer.children[currentChar];

    // Hvis vi trykker backspace
    if (ascii_key == 8) {
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

        // Hvis vi trykker enter
    } else if (ascii_key == 13) {
        console.log('Enter!');
        if (currentChar == 5) {
            guessWord();
        }
        else {
            console.log('Gotta type all 4 letters to guess a word!')
        }

        // Hvis det er et lowercase bogstav og vi ikke er paa sidste bogstav maa vi godt skrive
    } else if (isLetter(char) && currentChar <= 5) {
        console.log('Registered keypress: ' + char);

        if (wordContainer != undefined && currentCharBox != undefined) {

            if (currentCharBox.textContent != "" && currentChar >= 0 && currentChar <= 4) {
                console.log('Typed in new box, since there was a char here')
                currentChar++;
                currentCharBox = wordContainer.children[currentChar];
                currentCharBox.textContent = char;

            } else if (currentCharBox.textContent == "" && currentChar >= 0 && currentChar <= 4) {
                console.log('Typed in box because it was empty')
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
