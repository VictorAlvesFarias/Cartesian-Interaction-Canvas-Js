
function gridModule() {
    return {
        draw(ctx, socket, canvasState, players, canvas) {
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
        input(event, socket, canvasState) {
            if (event.target.id === 'gridSpacing') {
                canvasState.gridSpacing = parseInt(event.target.value);
                socket.emit('updateCanvasState', { gridSpacing: canvasState.gridSpacing });
            } else if (event.target.id === 'gridColor') {
                canvasState.gridColor = event.target.value;
                socket.emit('updateCanvasState', { gridColor: canvasState.gridColor });
            }
        },
        change(event, socket, canvasState) {
            if (event.target.id === 'gridOverlay') {
                canvasState.gridOverlay = event.target.checked;
                socket.emit('updateCanvasState', { gridOverlay: canvasState.gridOverlay });
            }
        }
    };
}