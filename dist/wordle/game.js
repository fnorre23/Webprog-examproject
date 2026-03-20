"use strict";
console.log('Here we go wordlin\'');
document.addEventListener("DOMContentLoaded", loadPage);
function loadPage() {
    document.addEventListener('keydown', typeLetter);
    let outputBox = document.getElementById("outputBox");
    if (outputBox != null) {
        outputBox.style.backgroundColor = 'red';
        console.log('Changed color');
    }
}
function typeLetter(event) {
    let outputBox = document.getElementById('outputBox');
    let char = String.fromCharCode(event.keyCode);
    console.log('Registered keypress: ' + char);
    if (outputBox != null) {
        outputBox.textContent = char;
    }
}
function checkWord(word) {
    for (let i = 0; i < word.length; i++) {
    }
}
//# sourceMappingURL=game.js.map