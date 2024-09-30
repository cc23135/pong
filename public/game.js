const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const socket = io();

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
        socket.emit('move', 'up');
    } else if (event.key === 'ArrowDown') {
        socket.emit('move', 'down');
    }
});

// Exibir a contagem regressiva antes do início do jogo
socket.on('gameStarted', () => {
    document.getElementById("warning").innerHTML = "START";
});

socket.on('update', ({ players, ball }) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha a parede vermelha
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 10, canvas.height); // Mova a parede para o lado esquerdo

    // Desenha os jogadores
    for (const id in players) {
        const player = players[id];
        ctx.fillStyle = player.color; // Usa a cor atribuída ao jogador
        ctx.fillRect(50, player.y, 10, 100);
    }

    // Desenha a bolinha
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2); // Desenha a bolinha
    ctx.fill();
});

socket.on('gameOver', () => {
    document.getElementById("warning").innerHTML = "GAME OVER";
});
