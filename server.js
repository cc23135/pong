const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let players = {};
let ball = { x: 400, y: 300, dx: 5, dy: 3 };
const wallX = 10;
let gameStarted = false;

const colors = ['red', 'green', 'blue', 'yellow', 'purple'];

io.on('connection', (socket) => {
    const playerColor = colors[Object.keys(players).length % colors.length];
    const playerX = 50 + Object.keys(players).length * 30;

    players[socket.id] = { 
        id: socket.id,
        x: playerX,
        y: 250,
        color: playerColor,
        size: 300 / (Object.keys(players).length + 1),
        speed: 10
    };

    reorganizePlayers();

    socket.on('disconnect', () => {
        delete players[socket.id];
        reorganizePlayers();
    });

    socket.on('move', (direction) => {
        const player = players[socket.id];
        if (direction === 'up' && player.y > 0) {
            player.y -= player.speed;
        } else if (direction === 'down' && player.y < 600 - player.size) {
            player.y += player.speed;
        }
    });
});

function reorganizePlayers() {
    const playerSize = 300 / (Object.keys(players).length);
    let playerX = 50;
    for (const id in players) {
        players[id].size = playerSize;
        players[id].x = playerX;
        playerX += 30;
    }
}

function startGame() {
    setTimeout(() => {
        gameStarted = true;
        io.emit('gameStarted');
    }, 5000);
}

function checkCollision(player, ball) {
    return (
        ball.x - 10 < player.x + 10 && 
        ball.x + 10 > player.x &&
        ball.y + 10 > player.y && 
        ball.y - 10 < player.y + player.size
    );
}

setInterval(() => {
    if (gameStarted) {
        ball.x += ball.dx;
        ball.y += ball.dy;

        if (ball.y <= 0 || ball.y >= 600) {
            ball.dy = -ball.dy;
        }

        if (ball.x <= 0 || ball.x >= 800) {
            ball.dx = -ball.dx;
        }

        if (ball.x <= wallX + 10) {
            io.emit('gameOver');
            ball.dx = 0;
            ball.dy = 0;
            setTimeout(() => {
                resetGame();
            }, 5000);
        }

        for (const id in players) {
            const player = players[id];
            if (checkCollision(player, ball)) {
                ball.dx = -ball.dx;
            }
        }
        

        io.emit('update', { players, ball });
    }
}, 1000 / 60);

startGame();

function resetGame() {
    ball = { x: getRandomInt(400, 700), y: getRandomInt(100, 600), dx: 3, dy: 4 };
    reorganizePlayers();
}

function getRandomInt(x, y) {
    const min = Math.ceil(Math.min(x, y));
    const max = Math.floor(Math.max(x, y));
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

server.listen(3000, () => {
    console.log('--- V: 1.3 ----------------------------');
});
