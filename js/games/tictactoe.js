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

const cells = document.querySelectorAll(".tictactoe-cell");
const currentPlayerElement = document.getElementById("currentPlayer");
const messageElement = document.getElementById("ticTacToeMessage");
const restartButton = document.getElementById("restartTicTacToe");

const twoPlayersModeButton = document.getElementById("twoPlayersMode");
const aiModeButton = document.getElementById("aiMode");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;
let gameMode = "twoPlayers";
let aiTimeoutId = null;
let isAiThinking = false;
let resultSaved = false;

const humanPlayer = "X";
const aiPlayer = "O";

const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]
];

if (
    cells.length === 0 ||
    !currentPlayerElement ||
    !messageElement ||
    !restartButton ||
    !twoPlayersModeButton ||
    !aiModeButton
) {
    console.error("Помилка: не знайдено один або кілька HTML-елементів для Tic-Tac-Toe.");
} else {
    cells.forEach(function(cell) {
        cell.addEventListener("click", handleCellClick);
    });

    restartButton.addEventListener("click", restartGame);
    twoPlayersModeButton.addEventListener("click", setTwoPlayersMode);
    aiModeButton.addEventListener("click", setAiMode);
}

function handleCellClick(event) {
    const cell = event.target;
    const index = Number(cell.getAttribute("data-index"));

    if (!gameActive) {
        return;
    }

    if (board[index] !== "") {
        return;
    }

    if (gameMode === "ai" && currentPlayer === aiPlayer) {
        return;
    }

    if (isAiThinking) {
        return;
    }

    makeMove(index, currentPlayer);

    if (checkResult(currentPlayer)) {
        return;
    }

    changePlayer();

    if (gameMode === "ai" && currentPlayer === aiPlayer && gameActive) {
        isAiThinking = true;

        aiTimeoutId = setTimeout(function() {
            makeAiMove();
            aiTimeoutId = null;
        }, 500);
    }
}

function makeMove(index, player) {
    board[index] = player;
    cells[index].textContent = player;
}

function checkResult(player) {
    for (let i = 0; i < winningCombinations.length; i++) {
        const combination = winningCombinations[i];

        const a = combination[0];
        const b = combination[1];
        const c = combination[2];

        if (board[a] !== "" && board[a] === board[b] && board[b] === board[c]) {
            if (gameMode === "ai" && player === aiPlayer) {
                messageElement.textContent = t("message.tictactoe.aiWin");
                saveTicTacToeResult("lose", player);
            } else {
                messageElement.textContent = formatText(t("message.tictactoe.playerWin"), {
                    player: player
                });

                if (gameMode === "ai") {
                    saveTicTacToeResult("win", player);
                } else {
                    saveTicTacToeResult("win", player);
                }
            }

            gameActive = false;
            isAiThinking = false;
            return true;
        }
    }

    if (!board.includes("")) {
        messageElement.textContent = t("message.tictactoe.draw");
        gameActive = false;
        isAiThinking = false;
        saveTicTacToeResult("draw", "none");
        return true;
    }

    return false;
}

function changePlayer() {
    if (currentPlayer === "X") {
        currentPlayer = "O";
    } else {
        currentPlayer = "X";
    }

    currentPlayerElement.textContent = currentPlayer;
}

function makeAiMove() {
    if (!gameActive) {
        isAiThinking = false;
        return;
    }

    if (currentPlayer !== aiPlayer) {
        isAiThinking = false;
        return;
    }

    const bestMove = findBestMove();

    if (bestMove !== -1) {
        makeMove(bestMove, aiPlayer);
    }

    if (checkResult(aiPlayer)) {
        return;
    }

    changePlayer();
    isAiThinking = false;
}

function findBestMove() {
    const winningMove = findMoveForPlayer(aiPlayer);

    if (winningMove !== -1) {
        return winningMove;
    }

    const blockingMove = findMoveForPlayer(humanPlayer);

    if (blockingMove !== -1) {
        return blockingMove;
    }

    if (board[4] === "") {
        return 4;
    }

    const corners = [0, 2, 6, 8];
    const emptyCorners = corners.filter(function(index) {
        return board[index] === "";
    });

    if (emptyCorners.length > 0) {
        return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
    }

    const emptyCells = [];

    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            emptyCells.push(i);
        }
    }

    if (emptyCells.length > 0) {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    return -1;
}

function findMoveForPlayer(player) {
    for (let i = 0; i < winningCombinations.length; i++) {
        const combination = winningCombinations[i];

        const a = combination[0];
        const b = combination[1];
        const c = combination[2];

        const values = [board[a], board[b], board[c]];
        const indexes = [a, b, c];

        let playerCount = 0;
        let emptyCount = 0;
        let emptyIndex = -1;

        for (let j = 0; j < values.length; j++) {
            if (values[j] === player) {
                playerCount++;
            }

            if (values[j] === "") {
                emptyCount++;
                emptyIndex = indexes[j];
            }
        }

        if (playerCount === 2 && emptyCount === 1) {
            return emptyIndex;
        }
    }

    return -1;
}

function restartGame() {
    clearAiTimer();

    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    gameActive = true;
    isAiThinking = false;
    resultSaved = false;

    currentPlayerElement.textContent = currentPlayer;
    messageElement.textContent = "";

    cells.forEach(function(cell) {
        cell.textContent = "";
    });
}

function clearAiTimer() {
    if (aiTimeoutId !== null) {
        clearTimeout(aiTimeoutId);
        aiTimeoutId = null;
    }
}

function setTwoPlayersMode() {
    gameMode = "twoPlayers";

    twoPlayersModeButton.classList.add("active-mode");
    aiModeButton.classList.remove("active-mode");

    restartGame();
}

function setAiMode() {
    gameMode = "ai";

    aiModeButton.classList.add("active-mode");
    twoPlayersModeButton.classList.remove("active-mode");

    restartGame();
}

async function saveTicTacToeResult(result, winner) {
    if (gameMode !== "ai") {
        return;
    }

    if (resultSaved) {
        return;
    }

    if (!window.gameApi || !window.gameApi.getAuthToken()) {
        return;
    }

    resultSaved = true;

    try {
        await window.gameApi.saveGameResult("Tic-Tac-Toe", result, 0, {
            mode: gameMode,
            winner: winner,
            moves: countTicTacToeMoves()
        });
    } catch (error) {
        console.error("Помилка збереження результату Tic-Tac-Toe:", error);
    }
}

function countTicTacToeMoves() {
    return board.filter(function(cell) {
        return cell !== "";
    }).length;
}