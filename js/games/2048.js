"use strict";

function t(key) {
    if (typeof translate === "function") {
        return translate(key);
    }

    return key;
}

function formatText(text, values) {
    let result = text;

    for (const key in values) {
        result = result.replace("{" + key + "}", values[key]);
    }

    return result;
}

const boardElement = document.getElementById("game-board");
const scoreElement = document.getElementById("score");
const messageElement = document.getElementById("message");
const restartBtn = document.getElementById("restartBtn");

let board;
let score;
let gameActive;
let hasWon;
let resultSaved;

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

if (!boardElement || !scoreElement || !messageElement || !restartBtn) {
    console.error("Помилка: не знайдено один або кілька HTML-елементів для гри 2048.");
} else {
    restartBtn.addEventListener("click", startGame);
    boardElement.addEventListener("touchstart", function(event) {
        if (!gameActive) {
            return;
        }

        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    }, { passive: true });

    boardElement.addEventListener("touchmove", function(event) {
        event.preventDefault();
    }, { passive: false });

    boardElement.addEventListener("touchend", function(event) {
        if (!gameActive) {
            return;
        }

        touchEndX = event.changedTouches[0].clientX;
        touchEndY = event.changedTouches[0].clientY;

        handleSwipe();
    }, { passive: true });

    document.addEventListener("keydown", function(event) {
        const allowedKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];

        if (!allowedKeys.includes(event.key)) {
            return;
        }

        event.preventDefault();

        if (!gameActive) {
            return;
        }

        if (event.key === "ArrowLeft") {
            moveLeft();
        } else if (event.key === "ArrowRight") {
            moveRight();
        } else if (event.key === "ArrowUp") {
            moveUp();
        } else if (event.key === "ArrowDown") {
            moveDown();
        }
    });

    startGame();
}

function startGame() {
    board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    score = 0;
    gameActive = true;
    hasWon = false;

    messageElement.textContent = "";

    addRandomTile();
    addRandomTile();
    drawBoard();
}

function drawBoard() {
    boardElement.innerHTML = "";

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const tile = document.createElement("div");
            tile.classList.add("tile");

            const value = board[row][col];

            if (value !== 0) {
                tile.textContent = value;
                tile.classList.add("tile-" + value);
            }

            boardElement.appendChild(tile);
        }
    }

    scoreElement.textContent = score;
}

function addRandomTile() {
    const emptyCells = [];

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (board[row][col] === 0) {
                emptyCells.push({ row: row, col: col });
            }
        }
    }

    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
    }
}

function slide(row) {
    row = row.filter(function(value) {
        return value !== 0;
    });

    for (let i = 0; i < row.length - 1; i++) {
        if (row[i] === row[i + 1]) {
            row[i] *= 2;
            score += row[i];
            row[i + 1] = 0;
        }
    }

    row = row.filter(function(value) {
        return value !== 0;
    });

    while (row.length < 4) {
        row.push(0);
    }

    return row;
}

function moveLeft() {
    const oldBoard = JSON.stringify(board);

    for (let row = 0; row < 4; row++) {
        board[row] = slide(board[row]);
    }

    afterMove(oldBoard);
}

function moveRight() {
    const oldBoard = JSON.stringify(board);

    for (let row = 0; row < 4; row++) {
        board[row].reverse();
        board[row] = slide(board[row]);
        board[row].reverse();
    }

    afterMove(oldBoard);
}

function moveUp() {
    const oldBoard = JSON.stringify(board);

    for (let col = 0; col < 4; col++) {
        let column = [];

        for (let row = 0; row < 4; row++) {
            column.push(board[row][col]);
        }

        column = slide(column);

        for (let row = 0; row < 4; row++) {
            board[row][col] = column[row];
        }
    }

    afterMove(oldBoard);
}

function moveDown() {
    const oldBoard = JSON.stringify(board);

    for (let col = 0; col < 4; col++) {
        let column = [];

        for (let row = 0; row < 4; row++) {
            column.push(board[row][col]);
        }

        column.reverse();
        column = slide(column);
        column.reverse();

        for (let row = 0; row < 4; row++) {
            board[row][col] = column[row];
        }
    }

    afterMove(oldBoard);
}

function afterMove(oldBoard) {
    const newBoard = JSON.stringify(board);

    if (oldBoard !== newBoard) {
        addRandomTile();
        drawBoard();
        checkWin();
        checkGameOver();
    }
}

function checkWin() {
    if (hasWon) {
        return;
    }

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (board[row][col] === 2048) {
                messageElement.textContent = t("message.2048.win");
                hasWon = true;
                save2048Result("win");
                return;
            }
        }
    }
}

function checkGameOver() {
    if (hasEmptyCell()) {
        return;
    }

    if (hasPossibleMove()) {
        return;
    }

    messageElement.textContent = t("message.2048.gameOver");
    gameActive = false;
    save2048Result("lose");
}

function hasEmptyCell() {
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (board[row][col] === 0) {
                return true;
            }
        }
    }

    return false;
}

function hasPossibleMove() {
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (col < 3 && board[row][col] === board[row][col + 1]) {
                return true;
            }

            if (row < 3 && board[row][col] === board[row + 1][col]) {
                return true;
            }
        }
    }

    return false;
}

function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    const minSwipeDistance = 30;

    if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
        return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
            moveRight();
        } else {
            moveLeft();
        }
    } else {
        if (deltaY > 0) {
            moveDown();
        } else {
            moveUp();
        }
    }
}

async function save2048Result(result) {
    if (resultSaved) {
        return;
    }

    if (!window.gameApi || !window.gameApi.getAuthToken()) {
        return;
    }

    resultSaved = true;

    try {
        await window.gameApi.saveGameResult("2048", result, score, {
            maxTile: getMaxTile()
        });
    } catch (error) {
        console.error("Помилка збереження результату 2048:", error);
    }
}

function getMaxTile() {
    let maxTile = 0;

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (board[row][col] > maxTile) {
                maxTile = board[row][col];
            }
        }
    }

    return maxTile;
}