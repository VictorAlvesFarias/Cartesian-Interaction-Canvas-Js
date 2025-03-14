
function draggingModule() {
    return {
        mouseUp(event, socket, canvasState, players, canvas) {
            canvasState.isDragging = false;
        },
        mouseDown(event, socket, canvasState, players, canvas) {
            if (event.button === 1) {
                canvasState.isDragging = true;
                canvasState.startX = event.clientX - canvasState.offsetX;
                canvasState.startY = event.clientY - canvasState.offsetY;
            }
        },
        mouseMove(event, socket, canvasState, players, canvas) {
            if (canvasState.isDragging) {
                canvasState.offsetX = event.clientX - canvasState.startX;
                canvasState.offsetY = event.clientY - canvasState.startY;
                socket.emit('updateCanvasState', { offsetX: canvasState.offsetX, offsetY: canvasState.offsetY });
            }
        },
    };
}
