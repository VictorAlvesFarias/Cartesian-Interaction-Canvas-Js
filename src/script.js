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

function getMousePos(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const worldX = (mouseX - canvasState.offsetX) / canvasState.scale;
    const worldY = (mouseY - canvasState.offsetY) / canvasState.scale;

    return { x: worldX, y: worldY };
}

function mouseIsInsidePlayer(id, x, y) {
    if (id == null) {
        return false
    }

    return Math.sqrt(((x - players[id].x) ** 2) + ((y - players[id].y) ** 2)) < players[id].radius
}

function draggingModule() {
    return {
        mouseUp() {
            canvasState.isDragging = false;
        },
        mouseDown(event) {
            if (event.button === 1) { // Botão do meio do mouse (arrastar o canvas)
                canvasState.isDragging = true;
                canvasState.startX = event.clientX - canvasState.offsetX;
                canvasState.startY = event.clientY - canvasState.offsetY;
            }
        },
        mouseMove(event) {
            if (canvasState.isDragging) {
                canvasState.offsetX = event.clientX - canvasState.startX;
                canvasState.offsetY = event.clientY - canvasState.startY;
                socket.emit('updateCanvasState', { offsetX: canvasState.offsetX, offsetY: canvasState.offsetY });
                draw();
            }
        }
    };
}

function gridModule() {
    return {
        draw() {
            ctx.save();
            ctx.strokeStyle = canvasState.gridColor;
            ctx.lineWidth = 0.5;

            const startX = (canvasState.offsetX % (canvasState.gridSpacing * canvasState.scale)) - (canvasState.gridSpacing * canvasState.scale);
            const startY = (canvasState.offsetY % (canvasState.gridSpacing * canvasState.scale)) - (canvasState.gridSpacing * canvasState.scale);

            for (let x = startX; x < canvas.width; x += canvasState.gridSpacing * canvasState.scale) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            for (let y = startY; y < canvas.height; y += canvasState.gridSpacing * canvasState.scale) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            ctx.restore();
        },
        input(event) {
            if (event.target.id === 'gridSpacing') {
                canvasState.gridSpacing = parseInt(event.target.value);
                socket.emit('updateCanvasState', { gridSpacing: canvasState.gridSpacing });
            } else if (event.target.id === 'gridColor') {
                canvasState.gridColor = event.target.value;
                socket.emit('updateCanvasState', { gridColor: canvasState.gridColor });
            }
        },
        change(event) {
            if (event.target.id === 'gridOverlay') {
                canvasState.gridOverlay = event.target.checked;
                socket.emit('updateCanvasState', { gridOverlay: canvasState.gridOverlay });
            }
        }
    };
}

function imageModule() {
    return {
        file(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    canvasState.image = new Image()
                    canvasState.image.src = e.target.result;
                    socket.emit('updateCanvasState', { image: e.target.result });
                };
                reader.readAsDataURL(file);
            }
        }
    };
}

function screenModule() {
    return {
        wheel(event) {
            event.preventDefault();
            const zoom = event.deltaY < 0 ? 1.1 : 1 / 1.1;
            const mouseX = event.clientX - canvasState.offsetX;
            const mouseY = event.clientY - canvasState.offsetY;

            canvasState.offsetX -= mouseX * (zoom - 1);
            canvasState.offsetY -= mouseY * (zoom - 1);
            canvasState.scale *= zoom;

            socket.emit('updateCanvasState', {
                offsetX: canvasState.offsetX,
                offsetY: canvasState.offsetY,
                scale: canvasState.scale
            });

            draw();
        }
    };
}

function playerModule() {
    return {
        mouseUp(event) {
            selectedPlayerId = null
        },
        mouseDown(event) {
            const { x, y } = getMousePos(canvas, event);

            if (mouseIsInsidePlayer(selectedPlayerId, x, y)) {
                draw()

                return;
            }
            else {
                selectedPlayerId = null
            }

            for (let id in players) {
                if (mouseIsInsidePlayer(id, x, y)) {
                    selectedPlayerId = id;

                    break;
                }
            }

            draw();
        },
        mouseMove(event) {
            if (selectedPlayerId) {
                const { x, y } = getMousePos(canvas, event);
                const player = players[selectedPlayerId];

                player.x = x;
                player.y = y;

                socket.emit('updatePlayer', {
                    id: selectedPlayerId,
                    x: player.x,
                    y: player.y
                });

                draw();
            }
        },
        draw() {
            ctx.save(); // Salva o estado atual do contexto
            ctx.translate(canvasState.offsetX, canvasState.offsetY); // Aplica o offset
            ctx.scale(canvasState.scale, canvasState.scale); // Aplica o scale

            // 1. Desenha todos os jogadores (sem destaque)
            for (let id in players) {
                const player = players[id];
                ctx.beginPath();
                ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
                ctx.fillStyle = player.color;
                ctx.fill();
                ctx.strokeStyle = "black";
                ctx.lineWidth = 0; // Borda padrão (sem destaque)
                ctx.stroke();
            }

            ctx.restore();

            if (selectedPlayerId !== null) {
                const selectedPlayerData = players[selectedPlayerId];

                ctx.save(); // Salva o estado atual do contexto
                ctx.translate(canvasState.offsetX, canvasState.offsetY); // Aplica o offset
                ctx.scale(canvasState.scale, canvasState.scale); // Aplica o scale

                ctx.beginPath();
                ctx.arc(selectedPlayerData.x, selectedPlayerData.y, selectedPlayerData.radius, 0, Math.PI * 2);
                ctx.fillStyle = selectedPlayerData.color;
                ctx.fill();
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2; // Borda destacada
                ctx.stroke();

                ctx.restore(); // Restaura o estado do contexto
            }
        }
    }
}

canvasState.image.onload = function () {
    draw();
};

socket.on('canvasState', (state) => {
    canvasState = { ...canvasState, ...state };
    draw();
});

socket.on('playerUpdated', (state) => {
    console.log("1",state)
    console.log("2",players[state.id])

    players[state.id] = {
        ...players[state.id],
        ...state
    }

    draw();
});

socket.on('playerDisconnected', (state) => {
    delete players[state.id]
})

socket.on('init', (state => {
    canvasState = state.canvasState
    players = state.players
    draw()
}))

canvas.addEventListener("wheel", (event) => {
    screenModule().wheel(event);
});

canvas.addEventListener("mousedown", (event) => {
    draggingModule().mouseDown(event);
    playerModule().mouseDown(event)
});

canvas.addEventListener("mousemove", (event) => {
    draggingModule().mouseMove(event);
    playerModule().mouseMove(event)
});

canvas.addEventListener("mouseup", (event) => {
    draggingModule().mouseUp(event);
    playerModule().mouseUp(event)
});

function events() {
    fileInput.addEventListener("change", (event) => {
        console.log(event)
        imageModule().file(event);
    });

    gridSpacingInput.addEventListener("input", (event) => {
        gridModule().input(event);
    });

    gridOverlayInput.addEventListener("change", (event) => {
        gridModule().change(event);
    });

    gridColorInput.addEventListener("input", (event) => {
        gridModule().input(event);
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!canvasState.gridOverlay) {
        gridModule().draw();
    }

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

    ctx.restore();

    if (canvasState.gridOverlay) {
        gridModule().draw();
    }

    playerModule().draw()
}

function init() {
    events()
    draw()
}

init()