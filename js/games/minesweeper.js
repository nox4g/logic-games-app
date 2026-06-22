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

const minesweeperBoard = document.getElementById("minesweeperBoard");
const minesweeperMessage = document.getElementById("minesweeperMessage");
const restartMinesweeper = document.getElementById("restartMinesweeper");
const minesCountElement = document.getElementById("minesCount");
const boardInfoElement = document.getElementById("boardInfo");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");

const difficulties = {
    easy: {
        size: 10,
        mines: 10,
        cellSize: 32
    },
    medium: {
        size: 15,
        mines: 35,
        cellSize: 28
    },
    hard: {
        size: 20,
        mines: 80,
        cellSize: 24
    }
};

let currentDifficulty = "easy";
let boardSize = difficulties.easy.size;
let minesCount = difficulties.easy.mines;

let board = [];
let gameOver = false;
let firstMove = true;
let openedCells = 0;
let resultSaved = false;

if (
    !minesweeperBoard ||
    !minesweeperMessage ||
    !restartMinesweeper ||
    !minesCountElement ||
    !boardInfoElement ||
    difficultyButtons.length === 0
) {
    console.error("Помилка: не знайдено один або кілька HTML-елементів для Minesweeper.");
} else {
    restartMinesweeper.addEventListener("click", startMinesweeper);

    difficultyButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            difficultyButtons.forEach(function(btn) {
                btn.classList.remove("active-difficulty");
            });

            button.classList.add("active-difficulty");
            currentDifficulty = button.dataset.difficulty;

            startMinesweeper();
        });
    });

    startMinesweeper();
}

function startMinesweeper() {
    const settings = difficulties[currentDifficulty];

    boardSize = settings.size;
    minesCount = settings.mines;

    board = createBlankBoard();
    gameOver = false;
    firstMove = true;
    openedCells = 0;
    resultSaved = false;

    minesweeperMessage.textContent = "";
    boardInfoElement.textContent = boardSize + "×" + boardSize;

    updateBoardSize();
    updateMinesCounter();
    drawBoard();
}

function updateBoardSize() {
    const settings = difficulties[currentDifficulty];

    minesweeperBoard.style.setProperty("--cell-size", settings.cellSize + "px");
    minesweeperBoard.style.gridTemplateColumns = "repeat(" + boardSize + ", var(--cell-size))";
}

function createBlankBoard() {
    const newBoard = [];

    for (let row = 0; row < boardSize; row++) {
        newBoard[row] = [];

        for (let col = 0; col < boardSize; col++) {
            newBoard[row][col] = {
                mine: false,
                open: false,
                flag: false,
                number: 0
            };
        }
    }

    return newBoard;
}

function drawBoard() {
    minesweeperBoard.innerHTML = "";

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cellElement = document.createElement("div");
            const cell = board[row][col];

            cellElement.classList.add("mine-cell");

            if (cell.open) {
                cellElement.classList.add("open");

                if (cell.mine) {
                    cellElement.classList.add("mine");
                    cellElement.textContent = "💣";
                } else if (cell.number > 0) {
                    cellElement.textContent = cell.number;
                    cellElement.classList.add("num-" + cell.number);
                }
            }

            if (cell.flag && !cell.open) {
                cellElement.classList.add("flag");
                cellElement.textContent = "🚩";
            }

            cellElement.addEventListener("click", function() {
                openCell(row, col);
            });

            cellElement.addEventListener("contextmenu", function(event) {
                event.preventDefault();
                toggleFlag(row, col);
            });

            minesweeperBoard.appendChild(cellElement);
        }
    }

    updateMinesCounter();
}

function openCell(row, col) {
    if (gameOver) {
        return;
    }

    const cell = board[row][col];

    if (cell.open || cell.flag) {
        return;
    }

    if (firstMove) {
        firstMove = false;

        createSafeFirstMove(row, col);
        revealZeroArea(row, col);

        checkWin();
        drawBoard();
        return;
    }

    if (cell.mine) {
        cell.open = true;
        endGame(false);
        return;
    }

    if (cell.number === 0) {
        revealZeroArea(row, col);
    } else {
        cell.open = true;
        openedCells++;
    }

    checkWin();
    drawBoard();
}

function createSafeFirstMove(startRow, startCol) {
    let bestBoard = null;
    let bestDifference = 999;

    const totalCells = boardSize * boardSize;
    const minOpen = Math.floor(totalCells * 0.25);
    const maxOpen = Math.floor(totalCells * 0.35);
    const idealOpen = Math.floor(totalCells * 0.3);

    for (let attempt = 0; attempt < 500; attempt++) {
        const candidateBoard = createBlankBoard();

        const zeroCore = createZeroCore(startRow, startCol);
        const protectedZone = createProtectedZone(zeroCore.set);

        placeMines(candidateBoard, protectedZone);
        calculateNumbers(candidateBoard);

        const openedAfterFirstClick = getCellsToReveal(candidateBoard, startRow, startCol);
        const openedCount = openedAfterFirstClick.length;

        if (openedCount >= minOpen && openedCount <= maxOpen) {
            board = candidateBoard;
            return;
        }

        const difference = Math.abs(openedCount - idealOpen);

        if (difference < bestDifference) {
            bestDifference = difference;
            bestBoard = candidateBoard;
        }
    }

    if (bestBoard !== null) {
        board = bestBoard;
    } else {
        board = createBlankBoard();

        const protectedZone = new Set();
        protectedZone.add(getKey(startRow, startCol));

        placeMines(board, protectedZone);
        calculateNumbers(board);
    }
}

function createZeroCore(startRow, startCol) {
    const totalCells = boardSize * boardSize;

    const minCore = Math.floor(totalCells * 0.08);
    const maxCore = Math.floor(totalCells * 0.12);

    const targetSize = randomInt(minCore, maxCore);

    const cells = [];
    const set = new Set();

    addToSet(startRow, startCol, cells, set);

    while (cells.length < targetSize) {
        const candidates = getCompactCandidates(set, startRow, startCol);

        if (candidates.length === 0) {
            break;
        }

        const selected = candidates[0];

        addToSet(selected.row, selected.col, cells, set);
    }

    return {
        cells: cells,
        set: set
    };
}

function getCompactCandidates(set, startRow, startCol) {
    const candidates = [];
    const used = new Set();

    set.forEach(function(key) {
        const position = keyToPosition(key);

        const directions = [
            { r: -1, c: 0 },
            { r: 1, c: 0 },
            { r: 0, c: -1 },
            { r: 0, c: 1 },
            { r: -1, c: -1 },
            { r: -1, c: 1 },
            { r: 1, c: -1 },
            { r: 1, c: 1 }
        ];

        for (let i = 0; i < directions.length; i++) {
            const newRow = position.row + directions[i].r;
            const newCol = position.col + directions[i].c;
            const newKey = getKey(newRow, newCol);

            if (!isInsideBoard(newRow, newCol)) {
                continue;
            }

            if (set.has(newKey) || used.has(newKey)) {
                continue;
            }

            const neighbors = countNeighborsInSet(newRow, newCol, set);
            const distance = getDistance(newRow, newCol, startRow, startCol);

            const score = neighbors * 12 - distance * 2 + Math.random() * 4;

            candidates.push({
                row: newRow,
                col: newCol,
                score: score
            });

            used.add(newKey);
        }
    });

    candidates.sort(function(a, b) {
        return b.score - a.score;
    });

    return candidates;
}

function createProtectedZone(coreSet) {
    const protectedZone = new Set();

    coreSet.forEach(function(key) {
        const position = keyToPosition(key);

        for (let row = position.row - 1; row <= position.row + 1; row++) {
            for (let col = position.col - 1; col <= position.col + 1; col++) {
                if (isInsideBoard(row, col)) {
                    protectedZone.add(getKey(row, col));
                }
            }
        }
    });

    return protectedZone;
}

function placeMines(currentBoard, protectedZone) {
    const borderCandidates = [];
    const otherCandidates = [];

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const key = getKey(row, col);

            if (protectedZone.has(key)) {
                continue;
            }

            if (isNearSet(row, col, protectedZone)) {
                borderCandidates.push({ row: row, col: col });
            } else {
                otherCandidates.push({ row: row, col: col });
            }
        }
    }

    shuffleArray(borderCandidates);
    shuffleArray(otherCandidates);

    let placedMines = 0;
    const maxBorderMines = Math.floor(minesCount * 0.18);

    for (let i = 0; i < borderCandidates.length && placedMines < maxBorderMines; i++) {
        const cell = borderCandidates[i];

        currentBoard[cell.row][cell.col].mine = true;
        placedMines++;
    }

    for (let i = 0; i < otherCandidates.length && placedMines < minesCount; i++) {
        const cell = otherCandidates[i];

        currentBoard[cell.row][cell.col].mine = true;
        placedMines++;
    }

    for (let i = maxBorderMines; i < borderCandidates.length && placedMines < minesCount; i++) {
        const cell = borderCandidates[i];

        if (!currentBoard[cell.row][cell.col].mine) {
            currentBoard[cell.row][cell.col].mine = true;
            placedMines++;
        }
    }
}

function revealZeroArea(startRow, startCol) {
    const cellsToReveal = getCellsToReveal(board, startRow, startCol);

    for (let i = 0; i < cellsToReveal.length; i++) {
        const row = cellsToReveal[i].row;
        const col = cellsToReveal[i].col;
        const cell = board[row][col];

        if (!cell.open && !cell.flag && !cell.mine) {
            cell.open = true;
            openedCells++;
        }
    }
}

function getCellsToReveal(currentBoard, startRow, startCol) {
    const result = [];
    const resultSet = new Set();
    const stack = [];

    const startCell = currentBoard[startRow][startCol];

    if (startCell.mine) {
        return result;
    }

    addRevealCell(startRow, startCol, result, resultSet);

    if (startCell.number === 0) {
        stack.push({ row: startRow, col: startCol });
    }

    while (stack.length > 0) {
        const current = stack.pop();

        for (let row = current.row - 1; row <= current.row + 1; row++) {
            for (let col = current.col - 1; col <= current.col + 1; col++) {
                if (!isInsideBoard(row, col)) {
                    continue;
                }

                const cell = currentBoard[row][col];

                if (cell.mine) {
                    continue;
                }

                const key = getKey(row, col);

                if (resultSet.has(key)) {
                    continue;
                }

                addRevealCell(row, col, result, resultSet);

                if (cell.number === 0) {
                    stack.push({ row: row, col: col });
                }
            }
        }
    }

    return result;
}

function addRevealCell(row, col, result, resultSet) {
    const key = getKey(row, col);

    if (!resultSet.has(key)) {
        resultSet.add(key);
        result.push({ row: row, col: col });
    }
}

function calculateNumbers(currentBoard) {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (currentBoard[row][col].mine) {
                continue;
            }

            let count = 0;

            for (let r = row - 1; r <= row + 1; r++) {
                for (let c = col - 1; c <= col + 1; c++) {
                    if (isInsideBoard(r, c) && currentBoard[r][c].mine) {
                        count++;
                    }
                }
            }

            currentBoard[row][col].number = count;
        }
    }
}

function toggleFlag(row, col) {
    if (gameOver) {
        return;
    }

    if (firstMove) {
        minesweeperMessage.textContent = t("message.minesweeper.firstMove");
        return;
    }

    const cell = board[row][col];

    if (cell.open) {
        return;
    }

    cell.flag = !cell.flag;
    minesweeperMessage.textContent = "";

    updateMinesCounter();
    drawBoard();
}

function updateMinesCounter() {
    let flags = 0;

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col].flag) {
                flags++;
            }
        }
    }

    minesCountElement.textContent = minesCount - flags;
}

function checkWin() {
    const safeCells = boardSize * boardSize - minesCount;

    if (openedCells === safeCells) {
        endGame(true);
    }
}

function endGame(win) {
    gameOver = true;

    if (win) {
        minesweeperMessage.textContent = t("message.minesweeper.win");
        saveMinesweeperResult("win");
    } else {
        revealAllMines();
        minesweeperMessage.textContent = t("message.minesweeper.lose");
        saveMinesweeperResult("lose");
    }

    drawBoard();
}

function revealAllMines() {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col].mine) {
                board[row][col].open = true;
            }
        }
    }
}

function addToSet(row, col, cells, set) {
    if (!isInsideBoard(row, col)) {
        return;
    }

    const key = getKey(row, col);

    if (!set.has(key)) {
        set.add(key);
        cells.push({ row: row, col: col });
    }
}

function countNeighborsInSet(row, col, set) {
    let count = 0;

    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
            if (r === row && c === col) {
                continue;
            }

            if (isInsideBoard(r, c) && set.has(getKey(r, c))) {
                count++;
            }
        }
    }

    return count;
}

function isNearSet(row, col, set) {
    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
            if (isInsideBoard(r, c) && set.has(getKey(r, c))) {
                return true;
            }
        }
    }

    return false;
}

function isInsideBoard(row, col) {
    return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
}

function getKey(row, col) {
    return row + "-" + col;
}

function keyToPosition(key) {
    const parts = key.split("-");

    return {
        row: Number(parts[0]),
        col: Number(parts[1])
    };
}

function getDistance(row1, col1, row2, col2) {
    return Math.sqrt(
        Math.pow(row1 - row2, 2) +
        Math.pow(col1 - col2, 2)
    );
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));

        const temp = array[i];
        array[i] = array[randomIndex];
        array[randomIndex] = temp;
    }
}

async function saveMinesweeperResult(result) {
    if (resultSaved) {
        return;
    }

    if (!window.gameApi || !window.gameApi.getAuthToken()) {
        return;
    }

    resultSaved = true;

    try {
        await window.gameApi.saveGameResult("Minesweeper", result, 0, {
            difficulty: currentDifficulty,
            openedCells: openedCells,
            boardSize: boardSize,
            minesCount: minesCount
        });
    } catch (error) {
        console.error("Помилка збереження результату Minesweeper:", error);
    }
}