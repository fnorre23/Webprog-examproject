
console.log('Here we go!');
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
    document.addEventListener('keydown', keydown);
}

function updateVariables(): void {
    wordContainer = wordContainers[currentGuess];
    currentCharBox = wordContainer.children[currentChar];
}

const enum keys { BACKSPACE = 8, ENTER = 13, }

const wordContainers: HTMLCollection = document.getElementsByClassName("wordContainer");
let currentChar: number = 0;
let currentGuess: number = 0;
let wordContainer: any = wordContainers[currentGuess];
let currentCharBox: any = wordContainer.children[currentChar];

function keydown(event: KeyboardEvent): void {
    const asciiKey: number = event.keyCode;
    const char: string = String.fromCharCode(asciiKey);

    if (asciiKey == keys.BACKSPACE) {
        console.log("Backspace!");
        deleteLetter();

    } else if (asciiKey == keys.ENTER) {
        console.log('Enter!');
        guessWord();

    } else if (isLetter(char) && currentChar <= 5) {
        typeLetter(char);

    } else {
        console.log('Invalid key');
    }
}


function guessWord(): void {

    updateVariables();

    if (currentChar != 5) {
        console.log('Gotta type all 5 letters to guess a word!')
        return;
    }

    let guess: string = "";

    for (let i: number = 0; i < wordContainer.children.length; i++) {
        guess = guess + wordContainer.children[i].textContent;
    }

    // for (word in valid_words) {
    //     if (guess == word) {
    //         // TODO: Send word til server for at gaette. guessWord() skal maaske vare async
    //         console.log('Guessed word: ' + guess);
    //
    //         currentGuess++;
    //         currentChar = 0;
    //         return;
    //     }
    // }

    // console.log('Not valid guess');

    console.log('Guessed word: ' + guess);
    currentGuess++;
    currentChar = 0;
}

// Hvis vi trykker backspace saa sletter vi bogstavet boksen, hvis boksen er tom, gaar vi lige en boks tilbage for at slette.
function deleteLetter(): void {

    updateVariables();

    console.log('deleting letter');

    if (currentChar == 5) {
        currentChar--;
        currentCharBox = wordContainer.children[currentChar];
    }

    if (wordContainer != undefined && currentCharBox != undefined) {

        console.log('current textcontent: ' + currentCharBox.textContent)

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
}

function typeLetter(char: string): void {

    updateVariables();

    if (wordContainer != undefined && currentCharBox != undefined) { console.log('Cant type'); return; }

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

