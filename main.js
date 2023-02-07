console.log("Hello World!");


const gameDiv = document.getElementById("game");

gameDiv.buttonEvent = (e) => {
    console.log(e);
}; // Placeholder

gameDiv.enableButtons = (enable) => {
    console.log("Enable Buttons", enable);
    for (let i = 2; i <= 8; ++i)
        gameDiv.children[i].ready = enable;
}

for (let i = 2; i <= 8; ++i) {
    const button = gameDiv.children[i];
    button.ready = false;
    button.addEventListener('click', (e) => {
        console.log(e.target.ready);
        if (e.target.ready) {
            gameDiv.buttonEvent(e);
        }
    })
}


const difficulty = 3;

const field = new Field();

const realStarts = Math.random() >= 0.5;
const player1 = realStarts ? new RealPlayer(true) : new AIPlayer(true, difficulty);
const player2 = !realStarts ? new RealPlayer(false) : new AIPlayer(false, difficulty);


let turn = 1;

let gameField = gameDiv.children[1];

function t() {
    field.print(gameField, turn === 1 ? -1 : player2.lastTurn);
    player1.turn(field, turn++, gameDiv, () => {
        console.log("Turn");
        field.print(gameField, player1.lastTurn);
        //console.log(field.hasWon(), field.won);
        if (field.hasWon() !== 0) {
            w();
            return;
        }
        console.log(player2);
        player2.turn(field, turn++, gameDiv, () => {
            //console.log(field.hasWon(), field.won);
            if (field.hasWon() !== 0) {
                w();
                return;
            }
            t();
        })
    });
}

function w() {
    field.print(gameField, turn % 2 === 1 ? player2.lastTurn : player1.lastTurn);

    if (field.hasWon() === (realStarts ? 1 : 2))
        gameDiv.children[0].textContent = "Du hast gewonnen!";
    else
        gameDiv.children[0].textContent = "Die KI hat gewonnen!";
}

t();