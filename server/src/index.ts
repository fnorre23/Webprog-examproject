// TODO: receive guesses and parse
// TODO: send answers back 

/* csv shit https://csv.js.org/parse/examples/async_iterator/ */
import { createReadStream } from 'node:fs';
import { parse } from 'csv-parse';
import { checkGuess } from './modules/wordle.ts';

// Server setup https://www.geeksforgeeks.org/node-js/how-to-create-a-simple-server-using-express-js/
import express from "express";

// Import til at skrive via cli for debugging
// import * as readline from 'node:readline/promises';
// import { stdin as input, stdout as output } from 'node:process';
// import fs from 'fs';

// Server setup
const app = express();
const PORT = 3000;

// Parser requests
app.use(express.text());

// 
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With,Content-Type, Accept');
    next();
});

app.get('/', (req, res) => {
    res.send('<h1>Hello, Geeks!</h1><p>This is your simple Express server.</p>');
});

app.post('/', (req, res) => {
    let jsonResponse = checkGuess(req.body);
    res.send(jsonResponse);
})

app.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
});

checkGuess('beans');

/* DEBUGGING IN THE CLI */
// const rl = readline.createInterface({ input, output });
// const guess: string = await rl.question('Guess a word: ');
// rl.close();
//
// let api_response = checkGuess(guess);
//
// fs.writeFile('guess.json', api_response, (err) => {
//     if (err) {
//         console.log('Error writing file:', err);
//     } else {
//         console.log('Successfully wrote file');
//     }
// });
