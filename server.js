const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let players = {};
let ball = { x: 400, y: 300, dx: 5, dy: 3 }; // Posição e velocidade da bolinha
const wallX = 10; // X da parede vermelha
let gameStarted = false;

// Cores para os jogadores
const colors = ['red', 'green', 'blue', 'yellow', 'purple']; // Adicione mais cores se necessário

io.on('connection', (socket) => {
    
    // Atribui uma cor ao jogador
    const playerColor = colors[Object.keys(players).length % colors.length];
    players[socket.id] = { id: socket.id, y: 250, color: playerColor };

    socket.on('disconnect', () => {
        delete players[socket.id];
    });

    socket.on('move', (direction) => {
        if (direction === 'up' && players[socket.id].y > 0) {
            players[socket.id].y -= 10;
        } else if (direction === 'down' && players[socket.id].y < 500) {
            players[socket.id].y += 10;
        }
    });
});

// Função para iniciar o jogo após 5 segundos
function startGame() {
    setTimeout(() => {
        gameStarted = true;
        io.emit('gameStarted');
    }, 5000);
}

setInterval(() => {
    if (gameStarted) {
        // Atualiza a posição da bolinha
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Colisão com o topo e fundo
        if (ball.y <= 0 || ball.y >= 600) {
            ball.dy = -ball.dy; // Reverte a direção da bolinha
        }

        if (ball.x <= 0 || ball.x >= 800) {
            ball.dx = -ball.dx; // Reverte a direção da bolinha
        }

        // Verifica se a bolinha toca a parede vermelha
        if (ball.x <= wallX + 10) { // +10 é a largura da parede
            io.emit('gameOver');
            ball.dx = 0
            ball.dy = 0
            setTimeout(() => {
                resetGame();
            }, 5000);
        }

        // Verifica colisão com os jogadores
        for (const id in players) {
            const player = players[id];
            if (
                ball.x <= 50 + 10 && // posição da barra do jogador
                ball.x >= 50 && // posição da barra do jogador
                ball.y >= player.y && 
                ball.y <= player.y + 100 // altura da barra do jogador
            ) {
                ball.dx = -ball.dx; // Inverte a direção da bolinha ao colidir com o jogador
            }
        }

        io.emit('update', { players, ball });
    }
}, 1000 / 60);

// Chama a função para iniciar o jogo
startGame();

function resetGame() {
    ball = { x: getRandomInt(400,700), y: getRandomInt(100,600), dx: 3, dy: 4 };
}

function getRandomInt(x, y) {
    const min = Math.ceil(Math.min(x, y));
    const max = Math.floor(Math.max(x, y));
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

server.listen(3000, () => {
    console.log('--- V: 1.2 ----------------------------');
});
