console.log('Here we go!');
document.addEventListener("DOMContentLoaded", loadPage);
const testLetter1 = {
    char: 'q',
    isInWord: false,
    isCorrect: false,
};
console.log('Character ' + testLetter1.char + ' is inWord ' + testLetter1.isInWord + ' and is correct ' + testLetter1.isCorrect);
function loadPage() {
    document.addEventListener('keydown', keydown);
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
function keydown(event) {
    const asciiKey = event.keyCode;
    const char = String.fromCharCode(asciiKey);
    if (asciiKey == keys.BACKSPACE) {
        console.log("Backspace!");
        deleteLetter();
    }
    else if (asciiKey == keys.ENTER) {
        console.log('Enter!');
        guessWord();
    }
    else if (isLetter(char) && currentChar <= 5) {
        typeLetter(char);
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
function typeLetter(char) {
    updateVariables();
    if (wordContainer != undefined && currentCharBox != undefined) {
        console.log('Cant type');
        return;
    }
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
function isLetter(str) {
    if (str.length === 1 && str.match(/[a-z]/i)) {
        return true;
    }
    else {
        return false;
    }
}
export {};
//# sourceMappingURL=game.js.map