


let canvasQueues = {
    drawQueue: [
        [playerModule().draw, 0],
        [gridModule().draw, 1]
    ],
    mouseUpQueue: [
        [draggingModule().mouseUp, 0],
        [playerModule().mouseUp, 1]
    ],
    mouseDownQueue: [
        [draggingModule().mouseDown, 0],
        [playerModule().mouseDown, 1]
    ],
    mouseMoveQueue: [
        [draggingModule().mouseMove, 0],
        [playerModule().mouseMove, 1]
    ],
    wheelQueue: [
        [screenModule().wheel, 0]
    ]
}

let gridSpacingInputQueues = {
    input: [
        [gridModule().input, 0]
    ]
}

let gridOverlayInputQueues = {
    change: [
        [gridModule().change, 0]
    ]
}

let gridColorInputInputQueues = {
    input: [
        [gridModule().input, 0]
    ]
}

let fileInputQueues = {
    change: [
        [imageModule().change, 0]
    ]
}