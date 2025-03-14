function imageModule() {
    return {
        change(event, socket, canvasState, players, canvas) {
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