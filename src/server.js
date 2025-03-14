const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const port = 3000
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://127.0.0.1:5500",
        methods: ["GET", "POST"]
    }
});

let canvasState = {
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    gridSpacing: 50,
    gridOverlay: true,
    gridColor: '#dddddd',
    image: null,
};

let players = {}

io.on('connection', (socket) => {
    console.log(socket.id)

    players[socket.id] = {
        x: Math.random() * 400 + 50,
        y: Math.random() * 300 + 50,
        radius: 20,
        id: socket.id,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16) // Cor aleatória
    };

    io.emit('playerUpdated', players[socket.id]);

    socket.emit('init', {
        canvasState,
        players
    })

    socket.on('updateCanvasState', (newState) => {
        canvasState = { ...canvasState, ...newState };

        io.emit('canvasState', canvasState);
    });

    socket.on('updatePlayer', (player) => {
        players[player.id] = {
            ...players[player.id],
            ...player
        }

        io.emit('playerUpdated', players[player.id]);
    })

    socket.on('disconnect', () => {

        io.emit('playerDisconnected', players[socket.id]);


        delete players[socket.id];
    });

});


server.listen(3000, () => {
    console.log('listening on *:' + port);
});