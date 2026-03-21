"use strict";
console.log('Here we go!');
document.addEventListener("DOMContentLoaded", loadPage);
function loadPage() {
    document.addEventListener('keydown', typeLetter);
}
var keys;
(function (keys) {
    keys[keys["BACKSPACE"] = 8] = "BACKSPACE";
    keys[keys["ENTER"] = 13] = "ENTER";
})(keys || (keys = {}));
const wordContainers = document.getElementsByClassName("wordContainer");
let currentChar = 0;
let currentGuess = 0;
function typeLetter(event) {
    const ascii_key = event.keyCode;
    const char = String.fromCharCode(ascii_key);
    const wordContainer = wordContainers[currentGuess];
    let currentCharBox = wordContainer.children[currentChar];
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
    }
    else if (ascii_key == keys.ENTER) {
        console.log('Enter!');
        if (currentChar == 5) {
            guessWord();
        }
        else {
            console.log('Gotta type all 4 letters to guess a word!');
        }
    }
    else if (isLetter(char) && currentChar <= 5) {
        console.log('Registered keypress: ' + char);
        if (wordContainer != undefined && currentCharBox != undefined) {
            if (currentCharBox.textContent != "" && currentChar >= 0 && currentChar <= 4) {
                currentChar++;
                currentCharBox = wordContainer.children[currentChar];
                currentCharBox.textContent = char;
            }
            else if (currentCharBox.textContent == "" && currentChar >= 0 && currentChar <= 4) {
                currentCharBox.textContent = char;
                currentChar++;
            }
            console.log("Current char num: " + currentChar);
        }
    }
    else {
        console.log('Invalid key');
    }
}
function checkWord(word) {
    for (let i = 0; i < word.length; i++) {
    }
}
function guessWord() {
    console.log('Guessed a word!');
    currentGuess++;
    currentChar = 0;
}
function isLetter(str) {
    if (str.length === 1 && str.match(/[a-z]/i)) {
        return true;
    }
    else {
        return false;
    }
}
//# sourceMappingURL=game.js.map