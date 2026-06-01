/* csv shit https://csv.js.org/parse/examples/async_iterator/ */
import { createReadStream } from 'node:fs';
import { parse } from 'csv-parse';
import type { Guess } from './types.ts';

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

// Saetter et nyt correct word. burde merges med setNewCorrectWord
async function getCorrectWord() {
    const words: string[] | undefined = await processWordsFile('./src/word-banks/word-bank.csv');
    const correctWord: string = words[Math.floor(Math.random() * words.length)]; // random ord
    if (!correctWord) throw new Error("No words available");
    return correctWord;
}

// En setter function basically
export async function setNewCorrectWord() {
    correctWord = await getCorrectWord();
};

// Parser csv fil saa vi har valid words, og generer vi et correct ord fra vores word bank, om er alle ord der kan vaere de rigtige. 
const validWords: string[] = await processWordsFile('./src/word-banks/valid-words.csv');
export let correctWord: string = await getCorrectWord();
console.log('The correct word for the round is: ' + correctWord);

/**
 * Checks guess.
* First declares JSONobject.
* If the word is not valid according to wordbank, it returns the guess with is_valid = false
* If word is equal to correctWord, it simply returns everything true
* Else it checks each letter against the letters in the correctword, and returns a matching JSON response 
 * */
export function checkGuess(guess: any) {

    let word_is_correct = false;
    let jsonResponse: Guess = {
        guess: guess,
        was_correct: false,
        is_valid: true,
        character_info: [
            {
                char1: guess[0],
                in_word: false,
                correct_idx: false,
            },
            {
                char2: guess[1],
                in_word: false,
                correct_idx: false,
            },
            {
                char3: guess[2],
                in_word: false,
                correct_idx: false,
            },
            {
                char4: guess[3],
                in_word: false,
                correct_idx: false,
            },
            {
                char5: guess[4],
                in_word: false,
                correct_idx: false,
            },
        ]
    }

    if (!validWords.includes(guess) || guess == undefined) {
        console.log('Word is not valid');

        jsonResponse.is_valid = false;

        return JSON.stringify(jsonResponse);
    }

    // Hvis ord er korrekt goer vi bare alt true
    if (guess === correctWord) {
        for (let i = 0; i < guess.length; i++) {
            jsonResponse.was_correct = true;
            jsonResponse.character_info[i].in_word = true;
            jsonResponse.character_info[i].correct_idx = true;
        }

        word_is_correct = true;

        return [JSON.stringify(jsonResponse), word_is_correct];
    }

    // Checking all letters against the correct word
    for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];

        if (letter == correctWord[i]) {

            jsonResponse.character_info[i].in_word = true;
            jsonResponse.character_info[i].correct_idx = true;

            continue;
        }

        if (correctWord.includes(letter)) {
            jsonResponse.character_info[i].in_word = true;
            continue;
        }

    }

    // console.log(JSON.stringify(jsonResponse));

    return [jsonResponse, word_is_correct];
}
