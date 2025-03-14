const socket = io('http://localhost:3000');
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const fileInput = document.getElementById("fileInput");
const gridSpacingInput = document.getElementById("gridSpacing");
const gridOverlayInput = document.getElementById("gridOverlay");
const gridColorInput = document.getElementById("gridColor");

let canvasState = {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    image: new Image(),
    gridSpacing: parseInt(gridSpacingInput.value),
    gridOverlay: gridOverlayInput.checked,
    gridColor: gridColorInput.value,
};

let players = {}
let selectedPlayerId = null

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

fileInput.addEventListener("change", (event) => {
    fileInputQueues.change.forEach(e => {
        e[0](event, socket, canvasState, players, canvas)
    })

    draw()
});

gridSpacingInput.addEventListener("input", (event) => {
    gridSpacingInputQueues.input.forEach(e => {
        e[0](event, socket, canvasState, players, canvas)
    })

    draw()
});

gridOverlayInput.addEventListener("change", (event) => {
    gridOverlayInputQueues.change.forEach(e => {
        e[0](event, socket, canvasState, players, canvas)
    })

    draw()
});

gridColorInput.addEventListener("input", (event) => {
    gridColorInputQueues.input.forEach(e => {
        e[0](event, socket, canvasState, players, canvas)
    })

    draw()
});

canvasState.image.onload = function () {
    draw();
};

socket.on('canvasState', (state) => {
    canvasState = { ...canvasState, ...state };

    draw();
});

socket.on('playerUpdated', (state) => {
    players[state.id] = {
        ...players[state.id],
        ...state
    }

    draw();
});

socket.on('playerDisconnected', (state) => {
    delete players[state.id]

    draw()
})

socket.on('init', (state => {
    canvasState = state.canvasState
    players = state.players

    draw()
}))

canvas.addEventListener("wheel", (event) => {
    canvasQueues.wheelQueue.forEach(e => {
        e[0](event, socket, canvasState, players, canvas)
    })

    draw()
});

canvas.addEventListener("mousedown", (event) => {
    canvasQueues.mouseDownQueue.forEach(e => {
        e[0](event, socket, canvasState, players, canvas)
    })

    draw()
});

canvas.addEventListener("mousemove", (event) => {
    canvasQueues.mouseMoveQueue.forEach(e => {
        e[0](event, socket, canvasState, players, canvas)
    })

    draw()
});

canvas.addEventListener("mouseup", (event) => {
    canvasQueues.mouseUpQueue.forEach(e => {
        e[0](event, socket, canvasState, players, canvas)
    })

    draw()
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvasState.offsetX, canvasState.offsetY);
    ctx.scale(canvasState.scale, canvasState.scale);

    if (canvasState.image) {
        const img = new Image();
        img.src = canvasState.image;

        if (img.complete) {
            ctx.drawImage(img, 0, 0);
        }
    }
    
    ctx.restore()

    canvasQueues.drawQueue.forEach(e => {
        e[0](ctx, socket, canvasState, players, canvas)
    })

    ctx.restore();
}

draw()