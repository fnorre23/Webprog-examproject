// TODO: receive guesses and parse
// TODO: send answers back 

/* csv shit https://csv.js.org/parse/examples/async_iterator/ */

import { createReadStream } from 'node:fs';
import { parse } from 'csv-parse';
// Import til at skrive via cli for debugging
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

// Desvaerre faaet lidt hjaelp fra claude her, men bygger paa officiel dok
// https://csv.js.org/parse/examples/async_iterator/
async function processWordsFile(path: string): Promise<string[]> {

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

async function getCorrectWord(): Promise<string> {
    const words: string[] | undefined = await processWordsFile('./word-bank.csv');
    const correctWord: string = words[Math.floor(Math.random() * words.length)]; // random ord
    if (!correctWord) throw new Error("No words available");
    return correctWord;
}

const validWords: string[] = await processWordsFile('./valid-words.csv');
const correctWord: string = await getCorrectWord();
console.log('The correct word for the round is: ' + correctWord);

// Kun til CLI debugging 
const rl = readline.createInterface({ input, output });
const answer: string = await rl.question('Guess a word: ');
rl.close();

// Hvis ord er i valid words, saa er det true. Dejlig nemt
if (validWords.includes(answer)) {
    console.log('Word is valid');
}

if (answer === correctWord) {
    console.log('Word is correct!');
} else {
    console.log('Word is not correct...');
}

