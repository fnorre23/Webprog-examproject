# Web-examproject

A Wordle Battle Royale! Compete against your friends in a
battle of the fewest guesses. But don't be too slow! Having the
same amount of guesses result in a tiebreaker based on who was the fastest.

## Preview 📽️

TODO: Video

## Technologies ⚙️

- Flutter for frontend

- Node.js for backend

## Running the project 🚗

You can run this project locally to host for you and your
friends.

### With Docker

Assuming you have docker installed, simply run the following commands:
```bash
git clone https://github.com/fnorre23/Webprog-examproject.git
cd Webprog-examproject
docker compose up
```

The site is then available ``` localhost:8080``` for the host. People on the same network can connect via your IP adress like this: 
``` http://<your-local-ip>:8080```. 

### Without Docker

**Dependencies**
You need the following software installed to run the project:
- Node.js
- Flutter

Run the following commands in your terminal, in the presented order:
```bash
# Clone the repo
git clone https://github.com/fnorre23/Webprog-examproject.git

# Build the Flutter frontend
cd client
flutter build web

# Install dependencies
cd ../server
npm install

# Run the server
node src/index.ts
```
The site is then available ``` localhost:8080``` for the host. People on the same network can connect via your IP adress like this: 
``` http://<your-local-ip>:8080```. 

## Known bugs

This project is still in a prototype stage.
There are 2 major bugs, that might interfere with gameplay:

1. If everyone loses, you will not get back to the lobby screen. Everyone needs to close the browser, and then reenter. 
2. The Wordle logic is does not account for duplicate letters in a word. As an example, if the word is blast, and you guess await, the
   first a will be yellow, while the other will be green, giving the impression that there are 2 a's in the word, even when there are
not, since it does not check for duplicate letters.
