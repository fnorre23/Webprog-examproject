// TODO: read and choose words from valid-words.csv
// TODO: compare word against word-bank.csv
// TODO: receive guesses and parse
// TODO: send answers back 


/* Det drilled med opsaetning, saa blev noedt til at spoerge Claude, for at rode med ts compiler og package.json er svaert */

/* csv shit */

import { createReadStream } from 'node:fs';
import { parse } from 'csv-parse';

async function processWordsFile(path: string) {

    let words: string[] = [];
    const parser = createReadStream(path).pipe(
        parse({ columns: false, trim: true, })
    );

    for await (const word of parser) {
        words.push(word);
    }

    return words;
}

// const validWords: string[] = processWordsFile('./valid-words.csv').then((words) => {
//
//     const correctWord = 'zoist';
//
//     for (const word of words) {
//
//         if (correctWord == word) {
//             console.log('We found the correct word! Correct word: ' + correctWord + ' and found word: ' + word);
//             break;
//         }
//     }
// });

const validWords: string[] = processWordsFile('./valid-words.csv');

const correctWord = 'zoist';

function checkWord() {

    // Problem: vi vil gerne undgaa at laese filen hver gang vi vil tjekke et ord, 
    // men vi vil heller ikke have bruger kan gaette foer de er klar. 
    // saa hvordan laeser vi den til at starte med, og garanterer den er klar foer vi kalder paa tjek word funktionen?

    processWordsFile('./valid-words.csv').then((words) => {

        for (const word of words) {

            if (correctWord == word) {
                console.log('We found the correct word! Correct word: ' + correctWord + ' and found word: ' + word);
                break;
            }
        }
    });
}

checkWord();
