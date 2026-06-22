    "use strict";

const checkersBoardElement = document.getElementById("checkersBoard");
const checkersMessage = document.getElementById("checkersMessage");
const restartCheckersButton = document.getElementById("restartCheckers");
const currentPlayerElement = document.getElementById("checkersCurrentPlayer");
const whitePiecesCountElement = document.getElementById("whitePiecesCount");
const blackPiecesCountElement = document.getElementById("blackPiecesCount");

const twoPlayersModeButton = document.getElementById("checkersTwoPlayersMode");
const aiModeButton = document.getElementById("checkersAiMode");

let board = [];
let currentPlayer = "white";
let selectedPiece = null;
let possibleMoves = [];
let gameOver = false;
let mustContinueCapture = false;

let gameMode = "twoPlayers";
let aiTimeoutId = null;
let isAiThinking = false;
let resultSaved = false;
let humanCapturedPieces = 0;

const humanPlayer = "white";
const aiPlayer = "black";

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

if (
    !checkersBoardElement ||
    !checkersMessage ||
    !restartCheckersButton ||
    !currentPlayerElement ||
    !whitePiecesCountElement ||
    !blackPiecesCountElement ||
    !twoPlayersModeButton ||
    !aiModeButton
) {
    console.error("Помилка: не знайдено один або кілька HTML-елементів для Checkers.");
} else {
    restartCheckersButton.addEventListener("click", startCheckers);
    twoPlayersModeButton.addEventListener("click", setTwoPlayersMode);
    aiModeButton.addEventListener("click", setAiMode);

    document.querySelectorAll(".language-select").forEach(function(select) {
        select.addEventListener("change", function() {
            setTimeout(function() {
                updateInfo();
            }, 0);
        });
    });

    startCheckers();
}

function setTwoPlayersMode() {
    gameMode = "twoPlayers";

    twoPlayersModeButton.classList.add("active-mode");
    aiModeButton.classList.remove("active-mode");

    startCheckers();
}

function setAiMode() {
    gameMode = "ai";

    aiModeButton.classList.add("active-mode");
    twoPlayersModeButton.classList.remove("active-mode");

    startCheckers();
}

function startCheckers() {
    clearAiTimer();

    board = createInitialBoard();
    currentPlayer = "white";
    selectedPiece = null;
    possibleMoves = [];
    gameOver = false;
    mustContinueCapture = false;
    isAiThinking = false;
    resultSaved = false;
    humanCapturedPieces = 0;

    checkersMessage.textContent = "";
    updateInfo();
    drawBoard();
}

function createInitialBoard() {
    const newBoard = [];

    for (let row = 0; row < 8; row++) {
        newBoard[row] = [];

        for (let col = 0; col < 8; col++) {
            newBoard[row][col] = null;

            if ((row + col) % 2 === 1) {
                if (row < 3) {
                    newBoard[row][col] = {
                        color: "black",
                        king: false
                    };
                } else if (row > 4) {
                    newBoard[row][col] = {
                        color: "white",
                        king: false
                    };
                }
            }
        }
    }

    return newBoard;
}

function drawBoard() {
    checkersBoardElement.innerHTML = "";

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const cell = document.createElement("div");
            const isDark = (row + col) % 2 === 1;
            const piece = board[row][col];

            cell.classList.add("checkers-cell");
            cell.classList.add(isDark ? "dark" : "light");

            if (selectedPiece !== null && selectedPiece.row === row && selectedPiece.col === col) {
                cell.classList.add("selected");
            }

            const move = findMove(row, col);

            if (move !== null) {
                if (move.capture) {
                    cell.classList.add("capture-move");
                } else {
                    cell.classList.add("possible-move");
                }
            }

            if (piece !== null) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("checker-piece", piece.color);

                if (piece.king) {
                    pieceElement.classList.add("king");
                }

                cell.appendChild(pieceElement);
            }

            cell.addEventListener("click", function() {
                handleCellClick(row, col);
            });

            checkersBoardElement.appendChild(cell);
        }
    }
}

function handleCellClick(row, col) {
    if (gameOver || isAiThinking) {
        return;
    }

    if (gameMode === "ai" && currentPlayer === aiPlayer) {
        return;
    }

    const piece = board[row][col];
    const move = findMove(row, col);

    if (move !== null && selectedPiece !== null) {
        makeMove(selectedPiece.row, selectedPiece.col, move);
        return;
    }

    if (piece === null) {
        return;
    }

    if (piece.color !== currentPlayer) {
        return;
    }

    if (mustContinueCapture) {
        return;
    }

    selectPiece(row, col);
}

function selectPiece(row, col) {
    const allCaptures = getAllCapturesForPlayer(currentPlayer);
    const pieceMoves = getMovesForPiece(row, col);

    if (allCaptures.length > 0) {
        const captureMoves = pieceMoves.filter(function(move) {
            return move.capture;
        });

        if (captureMoves.length === 0) {
            checkersMessage.textContent = t("message.checkers.mustCapture");
            return;
        }

        possibleMoves = captureMoves;
    } else {
        possibleMoves = pieceMoves;
    }

    if (possibleMoves.length === 0) {
        checkersMessage.textContent = t("message.checkers.noMovesForPiece");
        return;
    }

    selectedPiece = {
        row: row,
        col: col
    };

    checkersMessage.textContent = "";
    drawBoard();
}

function makeMove(fromRow, fromCol, move) {
    const piece = board[fromRow][fromCol];

    if (piece === null) {
        return;
    }

    board[move.row][move.col] = piece;
    board[fromRow][fromCol] = null;

    if (move.capture) {
        board[move.capturedRow][move.capturedCol] = null;

        if (gameMode === "ai" && currentPlayer === humanPlayer) {
            humanCapturedPieces++;
        }
    }

    promoteIfNeeded(move.row, move.col);

    selectedPiece = {
        row: move.row,
        col: move.col
    };

    possibleMoves = [];

    if (move.capture) {
        const nextCaptures = getMovesForPiece(move.row, move.col).filter(function(nextMove) {
            return nextMove.capture;
        });

        if (nextCaptures.length > 0) {
            possibleMoves = nextCaptures;
            mustContinueCapture = true;

            if (gameMode === "ai" && currentPlayer === aiPlayer) {
                checkersMessage.textContent = t("message.checkers.aiThinking");
                updateInfo();
                drawBoard();
                scheduleAiMove();
            } else {
                checkersMessage.textContent = t("message.checkers.continueCapture");
                updateInfo();
                drawBoard();
            }

            return;
        }
    }

    mustContinueCapture = false;
    selectedPiece = null;
    possibleMoves = [];

    switchPlayer();
    updateInfo();
    drawBoard();
    checkGameEnd();

    if (gameMode === "ai" && currentPlayer === aiPlayer && !gameOver) {
        scheduleAiMove();
    }
}

function scheduleAiMove() {
    clearAiTimer();

    isAiThinking = true;

    aiTimeoutId = setTimeout(function() {
        makeAiMove();
        aiTimeoutId = null;
    }, 600);
}

function makeAiMove() {
    if (gameOver || currentPlayer !== aiPlayer) {
        isAiThinking = false;
        return;
    }

    let aiMoveData = null;

    if (mustContinueCapture && selectedPiece !== null && possibleMoves.length > 0) {
        aiMoveData = {
            fromRow: selectedPiece.row,
            fromCol: selectedPiece.col,
            move: chooseBestMoveForAi(selectedPiece.row, selectedPiece.col, possibleMoves)
        };
    } else {
        aiMoveData = getBestAiMove();
    }

    if (aiMoveData === null) {
        endGame(humanPlayer);
        return;
    }

    selectedPiece = {
        row: aiMoveData.fromRow,
        col: aiMoveData.fromCol
    };

    possibleMoves = [aiMoveData.move];

    checkersMessage.textContent = t("message.checkers.aiThinking");
    drawBoard();

    aiTimeoutId = setTimeout(function() {
        makeMove(aiMoveData.fromRow, aiMoveData.fromCol, aiMoveData.move);
        isAiThinking = false;
        aiTimeoutId = null;
    }, 400);
}

function getBestAiMove() {
    const legalMoves = getAllLegalMovesForPlayer(aiPlayer);

    if (legalMoves.length === 0) {
        return null;
    }

    let bestMove = legalMoves[0];
    let bestScore = getAiMoveScore(bestMove);

    for (let i = 1; i < legalMoves.length; i++) {
        const score = getAiMoveScore(legalMoves[i]);

        if (score > bestScore) {
            bestScore = score;
            bestMove = legalMoves[i];
        }
    }

    return bestMove;
}

function chooseBestMoveForAi(fromRow, fromCol, moves) {
    let bestMove = moves[0];
    let bestScore = getAiMoveScore({
        fromRow: fromRow,
        fromCol: fromCol,
        move: bestMove
    });

    for (let i = 1; i < moves.length; i++) {
        const score = getAiMoveScore({
            fromRow: fromRow,
            fromCol: fromCol,
            move: moves[i]
        });

        if (score > bestScore) {
            bestScore = score;
            bestMove = moves[i];
        }
    }

    return bestMove;
}

function getAiMoveScore(moveData) {
    const move = moveData.move;
    const piece = board[moveData.fromRow][moveData.fromCol];

    let score = Math.random() * 5;

    if (move.capture) {
        score += 100;

        const capturedPiece = board[move.capturedRow][move.capturedCol];

        if (capturedPiece !== null && capturedPiece.king) {
            score += 50;
        }
    }

    if (piece !== null && piece.king) {
        score += 15;
    }

    if (piece !== null && piece.color === "black" && move.row === 7) {
        score += 40;
    }

    if (piece !== null && piece.color === "white" && move.row === 0) {
        score += 40;
    }

    return score;
}

function getAllLegalMovesForPlayer(player) {
    const allMoves = [];
    const captureMoves = [];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];

            if (piece !== null && piece.color === player) {
                const moves = getMovesForPiece(row, col);

                for (let i = 0; i < moves.length; i++) {
                    const moveData = {
                        fromRow: row,
                        fromCol: col,
                        move: moves[i]
                    };

                    allMoves.push(moveData);

                    if (moves[i].capture) {
                        captureMoves.push(moveData);
                    }
                }
            }
        }
    }

    if (captureMoves.length > 0) {
        return captureMoves;
    }

    return allMoves;
}

function getMovesForPiece(row, col) {
    const piece = board[row][col];

    if (piece === null) {
        return [];
    }

    if (piece.king) {
        return getKingMoves(row, col, piece);
    }

    return getManMoves(row, col, piece);
}

function getManMoves(row, col, piece) {
    const moves = [];

    const moveDirections = getManMoveDirections(piece);
    const captureDirections = getAllDiagonalDirections();

    for (let i = 0; i < moveDirections.length; i++) {
        const direction = moveDirections[i];

        const nextRow = row + direction.row;
        const nextCol = col + direction.col;

        if (isInsideBoard(nextRow, nextCol) && board[nextRow][nextCol] === null) {
            moves.push({
                row: nextRow,
                col: nextCol,
                capture: false
            });
        }
    }

    for (let i = 0; i < captureDirections.length; i++) {
        const direction = captureDirections[i];

        const enemyRow = row + direction.row;
        const enemyCol = col + direction.col;

        const landingRow = row + direction.row * 2;
        const landingCol = col + direction.col * 2;

        if (
            isInsideBoard(enemyRow, enemyCol) &&
            isInsideBoard(landingRow, landingCol) &&
            board[enemyRow][enemyCol] !== null &&
            board[enemyRow][enemyCol].color !== piece.color &&
            board[landingRow][landingCol] === null
        ) {
            moves.push({
                row: landingRow,
                col: landingCol,
                capture: true,
                capturedRow: enemyRow,
                capturedCol: enemyCol
            });
        }
    }

    return moves;
}

function getKingMoves(row, col, piece) {
    const moves = [];
    const directions = getAllDiagonalDirections();

    for (let i = 0; i < directions.length; i++) {
        const direction = directions[i];

        let currentRow = row + direction.row;
        let currentCol = col + direction.col;

        let enemyFound = false;
        let capturedRow = null;
        let capturedCol = null;

        while (isInsideBoard(currentRow, currentCol)) {
            const currentCell = board[currentRow][currentCol];

            if (currentCell === null && !enemyFound) {
                moves.push({
                    row: currentRow,
                    col: currentCol,
                    capture: false
                });
            }

            if (currentCell === null && enemyFound) {
                moves.push({
                    row: currentRow,
                    col: currentCol,
                    capture: true,
                    capturedRow: capturedRow,
                    capturedCol: capturedCol
                });
            }

            if (currentCell !== null && currentCell.color === piece.color) {
                break;
            }

            if (currentCell !== null && currentCell.color !== piece.color) {
                if (enemyFound) {
                    break;
                }

                enemyFound = true;
                capturedRow = currentRow;
                capturedCol = currentCol;
            }

            currentRow += direction.row;
            currentCol += direction.col;
        }
    }

    return moves;
}

function getManMoveDirections(piece) {
    if (piece.color === "white") {
        return [
            { row: -1, col: -1 },
            { row: -1, col: 1 }
        ];
    }

    return [
        { row: 1, col: -1 },
        { row: 1, col: 1 }
    ];
}

function getAllDiagonalDirections() {
    return [
        { row: -1, col: -1 },
        { row: -1, col: 1 },
        { row: 1, col: -1 },
        { row: 1, col: 1 }
    ];
}

function getAllCapturesForPlayer(player) {
    const captures = [];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];

            if (piece !== null && piece.color === player) {
                const pieceCaptures = getMovesForPiece(row, col).filter(function(move) {
                    return move.capture;
                });

                captures.push(...pieceCaptures);
            }
        }
    }

    return captures;
}

function findMove(row, col) {
    for (let i = 0; i < possibleMoves.length; i++) {
        if (possibleMoves[i].row === row && possibleMoves[i].col === col) {
            return possibleMoves[i];
        }
    }

    return null;
}

function promoteIfNeeded(row, col) {
    const piece = board[row][col];

    if (piece === null || piece.king) {
        return;
    }

    if (piece.color === "white" && row === 0) {
        piece.king = true;
    }

    if (piece.color === "black" && row === 7) {
        piece.king = true;
    }
}

function switchPlayer() {
    if (currentPlayer === "white") {
        currentPlayer = "black";
    } else {
        currentPlayer = "white";
    }
}

function checkGameEnd() {
    const whiteCount = countPieces("white");
    const blackCount = countPieces("black");

    if (whiteCount === 0) {
        endGame("black");
        return;
    }

    if (blackCount === 0) {
        endGame("white");
        return;
    }

    if (!playerHasMoves(currentPlayer)) {
        const winner = currentPlayer === "white" ? "black" : "white";
        endGame(winner);
    }
}

function playerHasMoves(player) {
    return getAllLegalMovesForPlayer(player).length > 0;
}

function endGame(winner) {
    gameOver = true;
    clearAiTimer();

    const winnerName = getPlayerName(winner);

    checkersMessage.textContent = formatText(t("message.checkers.win"), {
        player: winnerName
    });

    saveCheckersResult(winner);
}

function countPieces(color) {
    let count = 0;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] !== null && board[row][col].color === color) {
                count++;
            }
        }
    }

    return count;
}

function updateInfo() {
    currentPlayerElement.textContent = getPlayerName(currentPlayer);
    whitePiecesCountElement.textContent = countPieces("white");
    blackPiecesCountElement.textContent = countPieces("black");
}

function getPlayerName(player) {
    if (player === "white") {
        return t("game.checkers.white");
    }

    return t("game.checkers.black");
}

function clearAiTimer() {
    if (aiTimeoutId !== null) {
        clearTimeout(aiTimeoutId);
        aiTimeoutId = null;
    }
}

function isInsideBoard(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

async function saveCheckersResult(winner) {
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

    const result = winner === humanPlayer ? "win" : "lose";

    try {
        await window.gameApi.saveGameResult("Checkers", result, 0, {
            mode: gameMode,
            winner: winner,
            capturedPieces: humanCapturedPieces,
            whitePieces: countPieces("white"),
            blackPieces: countPieces("black")
        });
    } catch (error) {
        console.error("Помилка збереження результату Checkers:", error);
    }
}