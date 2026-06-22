"use strict";

const chessBoardElement = document.getElementById("chessBoard");
const chessMessage = document.getElementById("chessMessage");
const restartChessButton = document.getElementById("restartChess");
const chessCurrentPlayerElement = document.getElementById("chessCurrentPlayer");

const chessTwoPlayersModeButton = document.getElementById("chessTwoPlayersMode");
const chessAiModeButton = document.getElementById("chessAiMode");
const chessDifficultyButtons = document.querySelectorAll(".chess-difficulty-btn");
const chessDifficultyBox = document.getElementById("chessDifficultyBox");

let board = [];
let currentPlayer = "white";
let selectedPiece = null;
let possibleMoves = [];
let gameOver = false;

let gameMode = "twoPlayers";
let aiDifficulty = "easy";
let aiTimeoutId = null;
let isAiThinking = false;
let resultSaved = false;

const humanPlayer = "white";
const aiPlayer = "black";

const pieceValues = {
    pawn: 100,
    knight: 320,
    bishop: 330,
    rook: 500,
    queen: 900,
    king: 20000
};

const pieceSymbols = {
    white: {
        king: "♔",
        queen: "♕",
        rook: "♖",
        bishop: "♗",
        knight: "♘",
        pawn: "♙"
    },
    black: {
        king: "♚",
        queen: "♛",
        rook: "♜",
        bishop: "♝",
        knight: "♞",
        pawn: "♟"
    }
};

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
    !chessBoardElement ||
    !chessMessage ||
    !restartChessButton ||
    !chessCurrentPlayerElement ||
    !chessTwoPlayersModeButton ||
    !chessAiModeButton ||
    !chessDifficultyBox ||
    chessDifficultyButtons.length === 0
) {
    console.error("Помилка: не знайдено один або кілька HTML-елементів для Chess.");
} else {
    restartChessButton.addEventListener("click", startChess);
    chessTwoPlayersModeButton.addEventListener("click", setTwoPlayersMode);
    chessAiModeButton.addEventListener("click", setAiMode);

    chessDifficultyButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            chessDifficultyButtons.forEach(function(btn) {
                btn.classList.remove("active-difficulty");
            });

            button.classList.add("active-difficulty");
            aiDifficulty = button.dataset.difficulty;
        });
    });

    document.querySelectorAll(".language-select").forEach(function(select) {
        select.addEventListener("change", function() {
            setTimeout(function() {
                updateInfo();
                updateCheckMessage();
            }, 0);
        });
    });

    startChess();
}

function setTwoPlayersMode() {
    gameMode = "twoPlayers";

    chessTwoPlayersModeButton.classList.add("active-mode");
    chessAiModeButton.classList.remove("active-mode");
    
    chessDifficultyBox.classList.add("hidden");

    startChess();
}

function setAiMode() {
    gameMode = "ai";

    chessAiModeButton.classList.add("active-mode");
    chessTwoPlayersModeButton.classList.remove("active-mode");

    chessDifficultyBox.classList.remove("hidden");

    startChess();
}

function startChess() {
    clearAiTimer();

    board = createInitialBoard();
    currentPlayer = "white";
    selectedPiece = null;
    possibleMoves = [];
    gameOver = false;
    isAiThinking = false;
    resultSaved = false;

    chessMessage.textContent = "";
    updateInfo();
    drawBoard();
}

function createInitialBoard() {
    const newBoard = createEmptyBoard();

    newBoard[0] = [
        createPiece("black", "rook"),
        createPiece("black", "knight"),
        createPiece("black", "bishop"),
        createPiece("black", "queen"),
        createPiece("black", "king"),
        createPiece("black", "bishop"),
        createPiece("black", "knight"),
        createPiece("black", "rook")
    ];

    for (let col = 0; col < 8; col++) {
        newBoard[1][col] = createPiece("black", "pawn");
        newBoard[6][col] = createPiece("white", "pawn");
    }

    newBoard[7] = [
        createPiece("white", "rook"),
        createPiece("white", "knight"),
        createPiece("white", "bishop"),
        createPiece("white", "queen"),
        createPiece("white", "king"),
        createPiece("white", "bishop"),
        createPiece("white", "knight"),
        createPiece("white", "rook")
    ];

    return newBoard;
}

function createEmptyBoard() {
    const newBoard = [];

    for (let row = 0; row < 8; row++) {
        newBoard[row] = [];

        for (let col = 0; col < 8; col++) {
            newBoard[row][col] = null;
        }
    }

    return newBoard;
}

function createPiece(color, type) {
    return {
        color: color,
        type: type,
        moved: false
    };
}

function drawBoard() {
    chessBoardElement.innerHTML = "";

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const cell = document.createElement("div");
            const piece = board[row][col];
            const isLight = (row + col) % 2 === 0;

            cell.classList.add("chess-cell");
            cell.classList.add(isLight ? "light" : "dark");

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
                pieceElement.classList.add("chess-piece", piece.color);
                pieceElement.textContent = pieceSymbols[piece.color][piece.type];

                cell.appendChild(pieceElement);
            }

            cell.addEventListener("click", function() {
                handleCellClick(row, col);
            });

            chessBoardElement.appendChild(cell);
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
        selectedPiece = null;
        possibleMoves = [];
        drawBoard();
        return;
    }

    if (piece.color !== currentPlayer) {
        return;
    }

    selectPiece(row, col);
}

function selectPiece(row, col) {
    selectedPiece = {
        row: row,
        col: col
    };

    possibleMoves = getLegalMovesForPiece(board, row, col);

    if (possibleMoves.length === 0) {
        chessMessage.textContent = t("message.chess.noMovesForPiece");
    } else {
        chessMessage.textContent = "";
    }

    drawBoard();
}

function makeMove(fromRow, fromCol, move) {
    applyMoveOnBoard(board, fromRow, fromCol, move);

    selectedPiece = null;
    possibleMoves = [];

    switchPlayer();
    updateInfo();
    drawBoard();
    checkGameState();

    if (gameMode === "ai" && currentPlayer === aiPlayer && !gameOver) {
        scheduleAiMove();
    }
}

function applyMoveOnBoard(boardState, fromRow, fromCol, move) {
    const piece = boardState[fromRow][fromCol];

    boardState[move.row][move.col] = piece;
    boardState[fromRow][fromCol] = null;

    if (piece !== null) {
        piece.moved = true;
    }

    if (move.castle) {
        const rook = boardState[fromRow][move.rookFromCol];

        boardState[fromRow][move.rookToCol] = rook;
        boardState[fromRow][move.rookFromCol] = null;

        if (rook !== null) {
            rook.moved = true;
        }
    }

    promotePawnIfNeededOnBoard(boardState, move.row, move.col);
}

function checkGameState() {
    const legalMoves = getAllLegalMovesForPlayer(board, currentPlayer);

    if (legalMoves.length === 0) {
        if (isKingInCheck(board, currentPlayer)) {
            const winner = getOpponent(currentPlayer);

            gameOver = true;

            chessMessage.textContent = formatText(t("message.chess.checkmate"), {
                player: getPlayerName(winner)
            });

            saveChessResult(winner, "checkmate");
        } else {
            gameOver = true;
            chessMessage.textContent = t("message.chess.stalemate");

            saveChessResult(null, "stalemate");
        }

        return;
    }

    updateCheckMessage();
}

function updateCheckMessage() {
    if (gameOver) {
        return;
    }

    if (isKingInCheck(board, currentPlayer)) {
        chessMessage.textContent = formatText(t("message.chess.check"), {
            player: getPlayerName(currentPlayer)
        });
    }
}

/* ===== ШІ ===== */

function scheduleAiMove() {
    clearAiTimer();

    isAiThinking = true;
    chessMessage.textContent = t("message.chess.aiThinking");

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

    const moveData = chooseAiMove();

    if (moveData === null) {
        gameOver = true;
        chessMessage.textContent = t("message.chess.stalemate");
        isAiThinking = false;
        return;
    }

    applyMoveOnBoard(board, moveData.fromRow, moveData.fromCol, moveData.move);

    isAiThinking = false;
    selectedPiece = null;
    possibleMoves = [];

    switchPlayer();
    updateInfo();
    drawBoard();
    checkGameState();
}

function chooseAiMove() {
    const legalMoves = getAllLegalMovesForPlayer(board, aiPlayer);

    if (legalMoves.length === 0) {
        return null;
    }

    if (aiDifficulty === "easy") {
        return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }

    if (aiDifficulty === "medium") {
        return chooseBestMoveByScore(legalMoves);
    }

    if (aiDifficulty === "hard") {
        return chooseBestMoveByMinimax(legalMoves, 2);
    }

    if (aiDifficulty === "expert") {
        return chooseBestMoveByMinimax(legalMoves, 3);
    }

    return chooseBestMoveByScore(legalMoves);
}

function chooseBestMoveByScore(legalMoves) {
    let bestMove = legalMoves[0];
    let bestScore = getMoveScore(board, bestMove, aiPlayer);

    for (let i = 1; i < legalMoves.length; i++) {
        const score = getMoveScore(board, legalMoves[i], aiPlayer);

        if (score > bestScore) {
            bestScore = score;
            bestMove = legalMoves[i];
        }
    }

    return bestMove;
}

function chooseBestMoveByMinimax(legalMoves, depth) {
    let bestMove = legalMoves[0];
    let bestScore = -Infinity;

    for (let i = 0; i < legalMoves.length; i++) {
        const clonedBoard = cloneBoard(board);
        const moveData = legalMoves[i];

        applyMoveOnBoard(clonedBoard, moveData.fromRow, moveData.fromCol, moveData.move);

        const score = minimax(clonedBoard, depth, false, humanPlayer, -Infinity, Infinity);

        if (score > bestScore) {
            bestScore = score;
            bestMove = moveData;
        }
    }

    return bestMove;
}

function minimax(boardState, depth, maximizing, player, alpha, beta) {
    const legalMoves = getAllLegalMovesForPlayer(boardState, player);

    if (depth === 0 || legalMoves.length === 0) {
        return evaluateBoard(boardState);
    }

    if (maximizing) {
        let maxEval = -Infinity;

        for (let i = 0; i < legalMoves.length; i++) {
            const clonedBoard = cloneBoard(boardState);
            const moveData = legalMoves[i];

            applyMoveOnBoard(clonedBoard, moveData.fromRow, moveData.fromCol, moveData.move);

            const evaluation = minimax(clonedBoard, depth - 1, false, getOpponent(player), alpha, beta);

            maxEval = Math.max(maxEval, evaluation);
            alpha = Math.max(alpha, evaluation);

            if (beta <= alpha) {
                break;
            }
        }

        return maxEval;
    }

    let minEval = Infinity;

    for (let i = 0; i < legalMoves.length; i++) {
        const clonedBoard = cloneBoard(boardState);
        const moveData = legalMoves[i];

        applyMoveOnBoard(clonedBoard, moveData.fromRow, moveData.fromCol, moveData.move);

        const evaluation = minimax(clonedBoard, depth - 1, true, getOpponent(player), alpha, beta);

        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);

        if (beta <= alpha) {
            break;
        }
    }

    return minEval;
}

function evaluateBoard(boardState) {
    let score = 0;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = boardState[row][col];

            if (piece !== null) {
                const value = pieceValues[piece.type];

                if (piece.color === aiPlayer) {
                    score += value;
                } else {
                    score -= value;
                }
            }
        }
    }

    return score;
}

function getMoveScore(boardState, moveData, player) {
    const move = moveData.move;
    const targetPiece = boardState[move.row][move.col];

    let score = Math.random() * 5;

    if (targetPiece !== null) {
        score += pieceValues[targetPiece.type] || 0;
    }

    if (move.castle) {
        score += 40;
    }

    const piece = boardState[moveData.fromRow][moveData.fromCol];

    if (piece !== null && piece.type === "pawn") {
        if ((piece.color === "white" && move.row === 0) || (piece.color === "black" && move.row === 7)) {
            score += pieceValues.queen;
        }
    }

    const clonedBoard = cloneBoard(boardState);
    applyMoveOnBoard(clonedBoard, moveData.fromRow, moveData.fromCol, move);

    if (isKingInCheck(clonedBoard, getOpponent(player))) {
        score += 30;
    }

    return score;
}

/* ===== Генерація легальних ходів ===== */

function getAllLegalMovesForPlayer(boardState, player) {
    const moves = [];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = boardState[row][col];

            if (piece !== null && piece.color === player) {
                const pieceMoves = getLegalMovesForPiece(boardState, row, col);

                for (let i = 0; i < pieceMoves.length; i++) {
                    moves.push({
                        fromRow: row,
                        fromCol: col,
                        move: pieceMoves[i]
                    });
                }
            }
        }
    }

    return moves;
}

function getLegalMovesForPiece(boardState, row, col) {
    const piece = boardState[row][col];

    if (piece === null) {
        return [];
    }

    const pseudoMoves = getPseudoMovesForPiece(boardState, row, col, true);
    const legalMoves = [];

    for (let i = 0; i < pseudoMoves.length; i++) {
        const clonedBoard = cloneBoard(boardState);
        const move = pseudoMoves[i];

        applyMoveOnBoard(clonedBoard, row, col, move);

        if (!isKingInCheck(clonedBoard, piece.color)) {
            legalMoves.push(move);
        }
    }

    return legalMoves;
}

function getPseudoMovesForPiece(boardState, row, col, includeCastling) {
    const piece = boardState[row][col];

    if (piece === null) {
        return [];
    }

    if (piece.type === "pawn") {
        return getPawnMoves(boardState, row, col, piece);
    }

    if (piece.type === "rook") {
        return getSlidingMoves(boardState, row, col, piece, [
            { row: -1, col: 0 },
            { row: 1, col: 0 },
            { row: 0, col: -1 },
            { row: 0, col: 1 }
        ]);
    }

    if (piece.type === "bishop") {
        return getSlidingMoves(boardState, row, col, piece, [
            { row: -1, col: -1 },
            { row: -1, col: 1 },
            { row: 1, col: -1 },
            { row: 1, col: 1 }
        ]);
    }

    if (piece.type === "queen") {
        return getSlidingMoves(boardState, row, col, piece, [
            { row: -1, col: 0 },
            { row: 1, col: 0 },
            { row: 0, col: -1 },
            { row: 0, col: 1 },
            { row: -1, col: -1 },
            { row: -1, col: 1 },
            { row: 1, col: -1 },
            { row: 1, col: 1 }
        ]);
    }

    if (piece.type === "knight") {
        return getKnightMoves(boardState, row, col, piece);
    }

    if (piece.type === "king") {
        const moves = getKingMoves(boardState, row, col, piece);

        if (includeCastling) {
            const castlingMoves = getCastlingMoves(boardState, row, col, piece);
            moves.push(...castlingMoves);
        }

        return moves;
    }

    return [];
}

function getPawnMoves(boardState, row, col, piece) {
    const moves = [];
    const direction = piece.color === "white" ? -1 : 1;
    const startRow = piece.color === "white" ? 6 : 1;

    const oneStepRow = row + direction;

    if (isInsideBoard(oneStepRow, col) && boardState[oneStepRow][col] === null) {
        moves.push({
            row: oneStepRow,
            col: col,
            capture: false
        });

        const twoStepRow = row + direction * 2;

        if (row === startRow && isInsideBoard(twoStepRow, col) && boardState[twoStepRow][col] === null) {
            moves.push({
                row: twoStepRow,
                col: col,
                capture: false
            });
        }
    }

    const captureCols = [col - 1, col + 1];

    for (let i = 0; i < captureCols.length; i++) {
        const captureCol = captureCols[i];

        if (!isInsideBoard(oneStepRow, captureCol)) {
            continue;
        }

        const targetPiece = boardState[oneStepRow][captureCol];

        if (targetPiece !== null && targetPiece.color !== piece.color) {
            moves.push({
                row: oneStepRow,
                col: captureCol,
                capture: true
            });
        }
    }

    return moves;
}

function getSlidingMoves(boardState, row, col, piece, directions) {
    const moves = [];

    for (let i = 0; i < directions.length; i++) {
        const direction = directions[i];

        let currentRow = row + direction.row;
        let currentCol = col + direction.col;

        while (isInsideBoard(currentRow, currentCol)) {
            const targetPiece = boardState[currentRow][currentCol];

            if (targetPiece === null) {
                moves.push({
                    row: currentRow,
                    col: currentCol,
                    capture: false
                });
            } else {
                if (targetPiece.color !== piece.color && targetPiece.type !== "king") {
                    moves.push({
                        row: currentRow,
                        col: currentCol,
                        capture: true
                    });
                }

                break;
            }

            currentRow += direction.row;
            currentCol += direction.col;
        }
    }

    return moves;
}

function getKnightMoves(boardState, row, col, piece) {
    const moves = [];
    const directions = [
        { row: -2, col: -1 },
        { row: -2, col: 1 },
        { row: -1, col: -2 },
        { row: -1, col: 2 },
        { row: 1, col: -2 },
        { row: 1, col: 2 },
        { row: 2, col: -1 },
        { row: 2, col: 1 }
    ];

    for (let i = 0; i < directions.length; i++) {
        addMoveIfAvailable(boardState, moves, row + directions[i].row, col + directions[i].col, piece);
    }

    return moves;
}

function getKingMoves(boardState, row, col, piece) {
    const moves = [];
    const directions = [
        { row: -1, col: -1 },
        { row: -1, col: 0 },
        { row: -1, col: 1 },
        { row: 0, col: -1 },
        { row: 0, col: 1 },
        { row: 1, col: -1 },
        { row: 1, col: 0 },
        { row: 1, col: 1 }
    ];

    for (let i = 0; i < directions.length; i++) {
        addMoveIfAvailable(boardState, moves, row + directions[i].row, col + directions[i].col, piece);
    }

    return moves;
}

function addMoveIfAvailable(boardState, moves, row, col, piece) {
    if (!isInsideBoard(row, col)) {
        return;
    }

    const targetPiece = boardState[row][col];

    if (targetPiece === null) {
        moves.push({
            row: row,
            col: col,
            capture: false
        });
        return;
    }

    if (targetPiece.color !== piece.color && targetPiece.type !== "king") {
        moves.push({
            row: row,
            col: col,
            capture: true
        });
    }
}

/* ===== Рокіровка ===== */

function getCastlingMoves(boardState, row, col, piece) {
    const moves = [];

    if (piece.type !== "king" || piece.moved) {
        return moves;
    }

    if (col !== 4) {
        return moves;
    }

    if (isKingInCheck(boardState, piece.color)) {
        return moves;
    }

    const enemyColor = getOpponent(piece.color);

    // Коротка рокіровка
    if (canCastleKingside(boardState, row, piece.color, enemyColor)) {
        moves.push({
            row: row,
            col: 6,
            capture: false,
            castle: true,
            rookFromCol: 7,
            rookToCol: 5
        });
    }

    // Довга рокіровка
    if (canCastleQueenside(boardState, row, piece.color, enemyColor)) {
        moves.push({
            row: row,
            col: 2,
            capture: false,
            castle: true,
            rookFromCol: 0,
            rookToCol: 3
        });
    }

    return moves;
}

function canCastleKingside(boardState, row, color, enemyColor) {
    const rook = boardState[row][7];

    if (rook === null || rook.type !== "rook" || rook.color !== color || rook.moved) {
        return false;
    }

    if (boardState[row][5] !== null || boardState[row][6] !== null) {
        return false;
    }

    if (isSquareAttacked(boardState, row, 5, enemyColor)) {
        return false;
    }

    if (isSquareAttacked(boardState, row, 6, enemyColor)) {
        return false;
    }

    return true;
}

function canCastleQueenside(boardState, row, color, enemyColor) {
    const rook = boardState[row][0];

    if (rook === null || rook.type !== "rook" || rook.color !== color || rook.moved) {
        return false;
    }

    if (boardState[row][1] !== null || boardState[row][2] !== null || boardState[row][3] !== null) {
        return false;
    }

    if (isSquareAttacked(boardState, row, 3, enemyColor)) {
        return false;
    }

    if (isSquareAttacked(boardState, row, 2, enemyColor)) {
        return false;
    }

    return true;
}

/* ===== Шах і безпека короля ===== */

function isKingInCheck(boardState, color) {
    const kingPosition = findKing(boardState, color);

    if (kingPosition === null) {
        return true;
    }

    return isSquareAttacked(boardState, kingPosition.row, kingPosition.col, getOpponent(color));
}

function findKing(boardState, color) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = boardState[row][col];

            if (piece !== null && piece.color === color && piece.type === "king") {
                return {
                    row: row,
                    col: col
                };
            }
        }
    }

    return null;
}

function isSquareAttacked(boardState, targetRow, targetCol, attackerColor) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = boardState[row][col];

            if (piece !== null && piece.color === attackerColor) {
                if (pieceAttacksSquare(boardState, row, col, targetRow, targetCol)) {
                    return true;
                }
            }
        }
    }

    return false;
}

function pieceAttacksSquare(boardState, row, col, targetRow, targetCol) {
    const piece = boardState[row][col];

    if (piece === null) {
        return false;
    }

    if (piece.type === "pawn") {
        const direction = piece.color === "white" ? -1 : 1;

        return (
            targetRow === row + direction &&
            (targetCol === col - 1 || targetCol === col + 1)
        );
    }

    if (piece.type === "knight") {
        const rowDiff = Math.abs(targetRow - row);
        const colDiff = Math.abs(targetCol - col);

        return (
            (rowDiff === 2 && colDiff === 1) ||
            (rowDiff === 1 && colDiff === 2)
        );
    }

    if (piece.type === "king") {
        return Math.abs(targetRow - row) <= 1 && Math.abs(targetCol - col) <= 1;
    }

    if (piece.type === "rook") {
        return attacksBySliding(boardState, row, col, targetRow, targetCol, [
            { row: -1, col: 0 },
            { row: 1, col: 0 },
            { row: 0, col: -1 },
            { row: 0, col: 1 }
        ]);
    }

    if (piece.type === "bishop") {
        return attacksBySliding(boardState, row, col, targetRow, targetCol, [
            { row: -1, col: -1 },
            { row: -1, col: 1 },
            { row: 1, col: -1 },
            { row: 1, col: 1 }
        ]);
    }

    if (piece.type === "queen") {
        return attacksBySliding(boardState, row, col, targetRow, targetCol, [
            { row: -1, col: 0 },
            { row: 1, col: 0 },
            { row: 0, col: -1 },
            { row: 0, col: 1 },
            { row: -1, col: -1 },
            { row: -1, col: 1 },
            { row: 1, col: -1 },
            { row: 1, col: 1 }
        ]);
    }

    return false;
}

function attacksBySliding(boardState, row, col, targetRow, targetCol, directions) {
    for (let i = 0; i < directions.length; i++) {
        let currentRow = row + directions[i].row;
        let currentCol = col + directions[i].col;

        while (isInsideBoard(currentRow, currentCol)) {
            if (currentRow === targetRow && currentCol === targetCol) {
                return true;
            }

            if (boardState[currentRow][currentCol] !== null) {
                break;
            }

            currentRow += directions[i].row;
            currentCol += directions[i].col;
        }
    }

    return false;
}

/* ===== Допоміжні функції ===== */

function promotePawnIfNeededOnBoard(boardState, row, col) {
    const piece = boardState[row][col];

    if (piece === null || piece.type !== "pawn") {
        return;
    }

    if (piece.color === "white" && row === 0) {
        piece.type = "queen";

        if (boardState === board) {
            chessMessage.textContent = t("message.chess.pawnPromoted");
        }
    }

    if (piece.color === "black" && row === 7) {
        piece.type = "queen";

        if (boardState === board) {
            chessMessage.textContent = t("message.chess.pawnPromoted");
        }
    }
}

function switchPlayer() {
    currentPlayer = getOpponent(currentPlayer);
}

function getOpponent(player) {
    return player === "white" ? "black" : "white";
}

function updateInfo() {
    chessCurrentPlayerElement.textContent = getPlayerName(currentPlayer);
}

function getPlayerName(player) {
    if (player === "white") {
        return t("game.chess.white");
    }

    return t("game.chess.black");
}

function findMove(row, col) {
    for (let i = 0; i < possibleMoves.length; i++) {
        if (possibleMoves[i].row === row && possibleMoves[i].col === col) {
            return possibleMoves[i];
        }
    }

    return null;
}

function cloneBoard(boardState) {
    return boardState.map(function(row) {
        return row.map(function(piece) {
            if (piece === null) {
                return null;
            }

            return {
                color: piece.color,
                type: piece.type,
                moved: piece.moved
            };
        });
    });
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

async function saveChessResult(winner, reason) {
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

    let result = "draw";

    if (winner === humanPlayer) {
        result = "win";
    }

    if (winner === aiPlayer) {
        result = "lose";
    }

    try {
        await window.gameApi.saveGameResult("Chess", result, 0, {
            mode: gameMode,
            difficulty: aiDifficulty,
            winner: winner,
            reason: reason
        });
    } catch (error) {
        console.error("Помилка збереження результату Chess:", error);
    }
}