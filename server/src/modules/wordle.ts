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

    console.log('The correct word for the round is: ' + correctWord);

    return correctWord;
}

// En setter function basically
export async function setNewCorrectWord() {
    correctWord = await getCorrectWord();
};

// Parser csv fil saa vi har valid words, og generer vi et correct ord fra vores word bank, om er alle ord der kan vaere de rigtige. 
const validWords: string[] = await processWordsFile('./src/word-banks/valid-words.csv');
export let correctWord: string = await getCorrectWord();

/**
 * Checks guess.
* First declares JSONobject.
* If the word is not valid according to wordbank, it returns the guess with is_valid = false
* If word is equal to correctWord, it simply returns everything true
* Else it checks each letter against the letters in the correctword, and returns a matching JSON response 
 * */
export function checkGuess(guess: any) {

    let processedGuess: Guess = {
        guess: guess,
        was_correct: false,
        is_valid: true,
        // TODO: .map()
        character_info: [
            {
                char: guess[0],
                in_word: false,
                correct_idx: false,
            },
            {
                char: guess[1],
                in_word: false,
                correct_idx: false,
            },
            {
                char: guess[2],
                in_word: false,
                correct_idx: false,
            },
            {
                char: guess[3],
                in_word: false,
                correct_idx: false,
            },
            {
                char: guess[4],
                in_word: false,
                correct_idx: false,
            },
        ]
    }

    if (!validWords.includes(guess) || guess == undefined) {
        console.log('Word is not valid');

        processedGuess.is_valid = false;

        return processedGuess;
    }

    // Hvis ord er korrekt goer vi bare alt true
    if (guess === correctWord) {
        for (let i = 0; i < guess.length; i++) {
            processedGuess.was_correct = true;
            processedGuess.character_info[i].in_word = true;
            processedGuess.character_info[i].correct_idx = true;
        }

        return processedGuess;
    }

    // Checking all letters against the correct word
    for (let i = 0; i < guess.length; i++) {
        const letter = processedGuess.character_info[i].char;

        if (letter === correctWord[i]) {

            processedGuess.character_info[i].in_word = true;
            processedGuess.character_info[i].correct_idx = true;

            continue;
        }

        if (correctWord.includes(letter)) {
            processedGuess.character_info[i].in_word = true;
            continue;
        }

    }

    return processedGuess;
}
