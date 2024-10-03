const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const socket = io();

let movingUp = false;
let movingDown = false;

const updateMovement = () => {
    if (movingUp) {
        socket.emit('move', 'up');
    } else if (movingDown) {
        socket.emit('move', 'down');
    }
    requestAnimationFrame(updateMovement);
};

requestAnimationFrame(updateMovement);

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
        movingUp = true;
    } else if (event.key === 'ArrowDown') {
        movingDown = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowUp') {
        movingUp = false;
    } else if (event.key === 'ArrowDown') {
        movingDown = false;
    }
});

let countdown = null;

socket.on('countdown', (counter) => {
    countdown = counter;
});

socket.on('gameStarted', () => {});

socket.on('update', ({ players, ball }) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 10, canvas.height);

    for (const id in players) {
        const player = players[id];
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, 10, player.size);
    }

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2);
    ctx.fill();

    if (countdown !== null) {
        const fontSize = 48 + (Math.sin(Date.now() / 100) * 20); // Tamanho oscilante
        ctx.fillStyle = 'white';
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(countdown, canvas.width / 2, canvas.height / 2);

        if (countdown === 0) {
            countdown = null; // Limpar o contador após o término
        }
    }
});

gameOverVar = false

socket.on('gameOver', () => {
    gameOverVar = true
    //gameOver()
});

function gameOver(){
    if(gameOverVar == true)
    {
        gameOverVar = false
        
    let counter = 5;
    const countdownElement = document.getElementById('countdown');

    const interval = setInterval(() => {
        countdownElement.textContent = counter;
        counter--;

        if (counter < 0) {
            clearInterval(interval);
            countdownElement.textContent = ''; // Limpar após o término
        }
    }, 1000);

    }
}
