function screenModule() {
    return {
        wheel(event, socket, canvasState, players, canvas) {
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
        }
    };
}