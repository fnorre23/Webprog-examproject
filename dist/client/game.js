"use strict";
console.log('Here we go!');
document.addEventListener("DOMContentLoaded", loadPage);
function loadPage() {
    document.addEventListener('keydown', typeLetter);
    document.addEventListener('click', updateVariables);
}
function updateVariables() {
    wordContainer = wordContainers[currentGuess];
    currentCharBox = wordContainer.children[currentChar];
}
var keys;
(function (keys) {
    keys[keys["BACKSPACE"] = 8] = "BACKSPACE";
    keys[keys["ENTER"] = 13] = "ENTER";
})(keys || (keys = {}));
const wordContainers = document.getElementsByClassName("wordContainer");
let currentChar = 0;
let currentGuess = 0;
let wordContainer = wordContainers[currentGuess];
let currentCharBox = wordContainer.children[currentChar];
function typeLetter(event) {
    const ascii_key = event.keyCode;
    const char = String.fromCharCode(ascii_key);
    if (ascii_key == keys.BACKSPACE) {
        console.log("Backspace!");
        deleteLetter();
    }
    else if (ascii_key == keys.ENTER) {
        console.log('Enter!');
        guessWord();
    }
    else if (isLetter(char) && currentChar <= 5) {
        putLetter(char);
    }
    else {
        console.log('Invalid key');
    }
}
function guessWord() {
    updateVariables();
    if (currentChar != 5) {
        console.log('Gotta type all 5 letters to guess a word!');
        return;
    }
    let guess = "";
    for (let i = 0; i < wordContainer.children.length; i++) {
        guess = guess + wordContainer.children[i].textContent;
    }
    console.log('Guessed word: ' + guess);
    currentGuess++;
    currentChar = 0;
}
function deleteLetter() {
    updateVariables();
    console.log('deleting letter');
    if (currentChar == 5) {
        currentChar--;
        currentCharBox = wordContainer.children[currentChar];
    }
    if (wordContainer != undefined && currentCharBox != undefined) {
        console.log('current textcontent: ' + currentCharBox.textContent);
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
function putLetter(char) {
    updateVariables();
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
    else {
        console.log('Can\'t type this');
    }
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