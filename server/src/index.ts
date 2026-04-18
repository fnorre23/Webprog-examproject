// TODO: receive guesses and parse
// TODO: send answers back 

/* csv shit https://csv.js.org/parse/examples/async_iterator/ */
import { createReadStream } from 'node:fs';
import { parse } from 'csv-parse';

// Server setup https://www.geeksforgeeks.org/node-js/how-to-create-a-simple-server-using-express-js/
import express from "express";

// Import til at skrive via cli for debugging
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';


type Letter = {
    isInWord: boolean,
    isInCorrectPos: boolean,

}

type Word = {
    letter1: string,
    letter2: string,
    letter3: string,
    letter4: string,
    letter5: string,
}


// Server setup
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('<h1>Hello, Geeks!</h1><p>This is your simple Express server.</p>');
});

app.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
});

// Desvaerre faaet lidt hjaelp fra claude her, men bygger paa officiel docs
// https://csv.js.org/parse/examples/async_iterator/
async function processWordsFile(path: string) {

    let words: string[] = [];
    const parser = createReadStream(path).pipe(
        parse({ columns: false, trim: true, })
    );

    // Da parseren returner arrays af string, tager vi bare indholdet aka [0], da vi ved der kun er 1 string per linje
    for await (const word of parser) {
        words.push(word[0]);
    }
    return words;
}

async function getCorrectWord() {
    const words: string[] | undefined = await processWordsFile('./word-bank.csv');
    const correctWord: string = words[Math.floor(Math.random() * words.length)]; // random ord
    if (!correctWord) throw new Error("No words available");
    return correctWord;
}

// Parser csv fil saa vi har valid words, og generer vi et correct ord fra vores word bank, om er alle ord der kan vaere de rigtige. 
const validWords: string[] = await processWordsFile('./valid-words.csv');
const correctWord: string = await getCorrectWord();
console.log('The correct word for the round is: ' + correctWord);

// Kun til CLI debugging
const rl = readline.createInterface({ input, output });
const guess: string = await rl.question('Guess a word: ');
rl.close();

// Tjekker om gaet er korrekt. Hvis ikke, tjekker hvert bogstav
function checkWord(guess: string) {

    if (!validWords.includes(guess)) {
        console.log('Word is not valid');
        return false;
    }

    if (guess === correctWord) {
        console.log('Word is correct!');

        // saet alle bogstaver korrekt og isCorrect true

        return true;
    }

    console.log('Word is not correct...');


    return true;
    //logik til at tjekke bogstaver og return vores Word type
}

function checkLetters(guess: string) {
    for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];

        if (correctWord.includes(letter)) {

        }

    }
}

checkWord(guess);
