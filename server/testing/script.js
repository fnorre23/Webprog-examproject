console.log('Hello, World!');

const url = 'http://localhost:3000'

async function fetchTester(guess) {
    try {
        const response = await
            fetch(url, {
                method: "POST",
                body: guess,
            },);

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const jsonResponse = await response.json();

        console.log(jsonResponse);

    } catch (e) {
        console.log('Something went wrong: ');
        console.error(e);
    }
}

fetchTester('beans');
