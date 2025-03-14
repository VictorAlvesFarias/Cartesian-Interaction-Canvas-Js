function getMousePos(canvas, event, canvasState) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const worldX = (mouseX - canvasState.offsetX) / canvasState.scale;
    const worldY = (mouseY - canvasState.offsetY) / canvasState.scale;

    return { x: worldX, y: worldY };
}

function mouseIsInsidePlayer(id, x, y, players) {
    if (id == null) {
        return false
    }

    return Math.sqrt(((x - players[id].x) ** 2) + ((y - players[id].y) ** 2)) < players[id].radius
}

function playerModule() {
    return {
        mouseUp(event, socket, canvasState, players, canvas) {
            selectedPlayerId = null
        },
        mouseDown(event, socket, canvasState, players, canvas) {
            const { x, y } = getMousePos(canvas, event, canvasState);
            const oldSelectedPlayerId = selectedPlayerId

            if (mouseIsInsidePlayer(selectedPlayerId, x, y, players)) {
                return;
            }

            for (let id in players) {
                if (mouseIsInsidePlayer(id, x, y, players)) {
                    selectedPlayerId = id;

                    break;
                }
            }

            if (oldSelectedPlayerId != selectedPlayerId) {
                return;
            }

            selectedPlayerId = null
        },
        mouseMove(event, socket, canvasState, players, canvas) {
            if (selectedPlayerId) {
                const { x, y } = getMousePos(canvas, event, canvasState);
                const player = players[selectedPlayerId];

                player.x = x;
                player.y = y;

                socket.emit('updatePlayer', {
                    id: selectedPlayerId,
                    x: player.x,
                    y: player.y
                });
            }
        },
        draw(ctx, socket, canvasState, players, canvas) {
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