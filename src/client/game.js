console.log('Here we go!');
document.addEventListener("DOMContentLoaded", loadPage);
function loadPage() {
    document.addEventListener('keydown', typeLetter);
    // document.addEventListener('click', updateVariables); // Hver gang der klikkes dobbelttjekker vi at bokse er opdateret korrekt, saa man ogsaa kan bruge skaerm tastaturet
}
function updateVariables() {
    wordContainer = wordContainers[currentGuess];
    currentCharBox = wordContainer.children[currentChar];
}
var wordContainers = document.getElementsByClassName("wordContainer");
var currentChar = 0;
var currentGuess = 0;
var wordContainer = wordContainers[currentGuess];
var currentCharBox = wordContainer.children[currentChar];
function typeLetter(event) {
    var ascii_key = event.keyCode;
    var char = String.fromCharCode(ascii_key);
    if (ascii_key == 8 /* keys.BACKSPACE */) {
        console.log("Backspace!");
        deleteLetter();
    }
    else if (ascii_key == 13 /* keys.ENTER */) {
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
    var guess = "";
    for (var i = 0; i < wordContainer.children.length; i++) {
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
// Source - https://stackoverflow.com/a/9862788
// Posted by JaredPar
// Retrieved 2026-03-21, License - CC BY-SA 3.0
function isLetter(str) {
    if (str.length === 1 && str.match(/[a-z]/i)) {
        return true;
    }
    else {
        return false;
    }
}
