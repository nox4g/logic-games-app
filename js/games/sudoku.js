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

const sudokuBoard = document.getElementById("sudokuBoard");
const sudokuMessage = document.getElementById("sudokuMessage");
const newSudokuGameButton = document.getElementById("newSudokuGame");
const restartSameSudokuButton = document.getElementById("restartSameSudoku");
const hintSudokuButton = document.getElementById("hintSudoku");
const sudokuHintsElement = document.getElementById("sudokuHints");
const sudokuLivesElement = document.getElementById("sudokuLives");
const sudokuDifficultyName = document.getElementById("sudokuDifficultyName");
const difficultyButtons = document.querySelectorAll(".sudoku-difficulty-btn");
const numberButtons = document.querySelectorAll(".number-btn[data-number]");
const eraseButton = document.getElementById("eraseNumber");

const difficultySettings = {
    easy: {
        name: "Легка",
        removeCells: 36,
        lives: 5
    },
    medium: {
        name: "Середня",
        removeCells: 46,
        lives: 4
    },
    hard: {
        name: "Складна",
        removeCells: 56,
        lives: 3
    }
};

let currentDifficulty = "easy";

let solutionBoard = [];
let puzzleBoard = [];
let initialPuzzleBoard = [];
let userBoard = [];

let selectedRow = null;
let selectedCol = null;
let selectedNumber = null;

let lives = difficultySettings.easy.lives;
let maxLives = difficultySettings.easy.lives;
let gameOver = false;

const maxHints = 2;
let hintsLeft = maxHints;

let resultSaved = false;
let mistakesCount = 0;
let hintsUsedCount = 0;

if (
    !sudokuBoard ||
    !sudokuMessage ||
    !newSudokuGameButton ||
    !restartSameSudokuButton ||
    !hintSudokuButton ||
    !sudokuHintsElement ||
    !sudokuLivesElement ||
    !sudokuDifficultyName ||
    !eraseButton ||
    difficultyButtons.length === 0 ||
    numberButtons.length === 0
) {
    console.error("Помилка: не знайдено один або кілька HTML-елементів для Sudoku.");
} else {
    newSudokuGameButton.addEventListener("click", startNewSudokuGame);
    restartSameSudokuButton.addEventListener("click", restartSameSudoku);
    hintSudokuButton.addEventListener("click", useHint);
    eraseButton.addEventListener("click", eraseSelectedCell);

    difficultyButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            difficultyButtons.forEach(function(btn) {
                btn.classList.remove("active-difficulty");
            });

            button.classList.add("active-difficulty");
            currentDifficulty = button.dataset.difficulty;

            startNewSudokuGame();
        });
    });

    numberButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            const number = Number(button.dataset.number);

            selectedNumber = number;
            updateNumberButtons();

            if (selectedRow !== null && selectedCol !== null) {
                fillSelectedCell(number);
            } else {
                drawSudokuBoard();
            }
        });
    });

    document.addEventListener("keydown", handleKeyboardInput);

    startNewSudokuGame();
}

function startNewSudokuGame() {
    const settings = difficultySettings[currentDifficulty];

    solutionBoard = generateSolvedBoard();
    puzzleBoard = createPuzzleFromSolution(solutionBoard, settings.removeCells);
    initialPuzzleBoard = copyBoard(puzzleBoard);
    userBoard = copyBoard(puzzleBoard);

    maxLives = settings.lives;
    lives = maxLives;
    gameOver = false;
    hintsLeft = maxHints;

    resultSaved = false;
    mistakesCount = 0;
    hintsUsedCount = 0;

    updateHintsCounter();

    selectedRow = null;
    selectedCol = null;
    selectedNumber = null;

    sudokuMessage.textContent = "";
    sudokuLivesElement.textContent = lives;
    sudokuDifficultyName.textContent = settings.name;

    updateNumberButtons();
    drawSudokuBoard();
}

function restartSameSudoku() {
    puzzleBoard = copyBoard(initialPuzzleBoard);
    userBoard = copyBoard(initialPuzzleBoard);

    const settings = difficultySettings[currentDifficulty];

    lives = settings.lives;
    maxLives = settings.lives;
    gameOver = false;
    hintsLeft = maxHints;

    resultSaved = false;
    mistakesCount = 0;
    hintsUsedCount = 0;

    updateHintsCounter();

    selectedRow = null;
    selectedCol = null;
    selectedNumber = null;

    sudokuMessage.textContent = t("message.sudoku.restart");
    sudokuLivesElement.textContent = lives;

    updateNumberButtons();
    drawSudokuBoard();
}

function drawSudokuBoard() {
    sudokuBoard.innerHTML = "";

    const highlightNumber = getHighlightNumber();

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement("div");
            const value = userBoard[row][col];

            cell.classList.add("sudoku-cell");
            cell.dataset.row = row;
            cell.dataset.col = col;

            if (col === 2 || col === 5) {
                cell.classList.add("block-right");
            }

            if (row === 2 || row === 5) {
                cell.classList.add("block-bottom");
            }

            if (value !== 0) {
                cell.textContent = value;
            }

            if (puzzleBoard[row][col] !== 0) {
                cell.classList.add("fixed");
            }

            if (selectedRow !== null && selectedCol !== null) {
                if (
                    row === selectedRow ||
                    col === selectedCol ||
                    isSameBox(row, col, selectedRow, selectedCol)
                ) {
                    cell.classList.add("related");
                }

                if (row === selectedRow && col === selectedCol) {
                    cell.classList.add("selected");
                }
            }

            if (highlightNumber !== null && value === highlightNumber) {
                cell.classList.add("same-number");
            }

            if (
                selectedRow !== null &&
                selectedCol !== null &&
                selectedNumber !== null &&
                isConflictSource(row, col, selectedRow, selectedCol, selectedNumber)
            ) {
                cell.classList.add("blocked");
            }

            if (puzzleBoard[row][col] === 0 && value !== 0) {
                if (value === solutionBoard[row][col]) {
                    cell.classList.add("correct");
                } else {
                    cell.classList.add("wrong");
                }
            }

            cell.addEventListener("click", function() {
                selectCell(row, col);
            });

            sudokuBoard.appendChild(cell);
        }
    }
}

function selectCell(row, col) {
    if (gameOver) {
        return;
    }

    selectedRow = row;
    selectedCol = col;

    if (userBoard[row][col] !== 0) {
        selectedNumber = userBoard[row][col];
    }

    sudokuMessage.textContent = "";
    updateNumberButtons();
    drawSudokuBoard();
}

function fillSelectedCell(number) {
    if (gameOver) {
        return;
    }

    if (selectedRow === null || selectedCol === null) {
        sudokuMessage.textContent = t("message.sudoku.selectCell");
        return;
    }

    if (puzzleBoard[selectedRow][selectedCol] !== 0) {
        sudokuMessage.textContent = t("message.sudoku.fixedCell");
        return;
    }

    userBoard[selectedRow][selectedCol] = number;
    selectedNumber = number;

    if (number === solutionBoard[selectedRow][selectedCol]) {
        sudokuMessage.textContent = t("message.sudoku.correct");
    } else {
        mistakesCount++;
        lives--;

        sudokuLivesElement.textContent = lives;
        sudokuMessage.textContent = formatText(t("message.sudoku.wrong"), {
            lives: lives
        });

        if (lives <= 0) {
            endSudokuGame(false);
        }
    }

    updateNumberButtons();
    drawSudokuBoard();
    checkSudokuWin();
}

function eraseSelectedCell() {
    if (gameOver) {
        return;
    }

    if (selectedRow === null || selectedCol === null) {
        sudokuMessage.textContent = t("message.sudoku.selectCell");
        return;
    }

    if (puzzleBoard[selectedRow][selectedCol] !== 0) {
        return;
    }

    userBoard[selectedRow][selectedCol] = 0;
    sudokuMessage.textContent = "";

    drawSudokuBoard();
}

function checkFullSudoku() {
    if (gameOver) {
        return;
    }

    let hasEmptyCells = false;
    let hasMistakes = false;

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (userBoard[row][col] === 0) {
                hasEmptyCells = true;
            }

            if (userBoard[row][col] !== 0 && userBoard[row][col] !== solutionBoard[row][col]) {
                hasMistakes = true;
            }
        }
    }

    drawSudokuBoard();

    if (hasMistakes) {
        sudokuMessage.textContent = t("message.sudoku.hasMistakes");
        return;
    }

    if (hasEmptyCells) {
        sudokuMessage.textContent = t("message.sudoku.hasEmpty");
        return;
    }

    endSudokuGame(true);
}

function useHint() {
    if (gameOver) {
        return;
    }

    if (hintsLeft <= 0) {
        sudokuMessage.textContent = t("message.sudoku.hintsOver");
        return;
    }

    let hintCell = null;

    if (
        selectedRow !== null &&
        selectedCol !== null &&
        puzzleBoard[selectedRow][selectedCol] === 0 &&
        userBoard[selectedRow][selectedCol] !== solutionBoard[selectedRow][selectedCol]
    ) {
        hintCell = {
            row: selectedRow,
            col: selectedCol
        };
    } else {
        const availableCells = [];

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (
                    puzzleBoard[row][col] === 0 &&
                    userBoard[row][col] !== solutionBoard[row][col]
                ) {
                    availableCells.push({
                        row: row,
                        col: col
                    });
                }
            }
        }

        if (availableCells.length === 0) {
            sudokuMessage.textContent = t("message.sudoku.allFilled");
            return;
        }

        hintCell = availableCells[Math.floor(Math.random() * availableCells.length)];
    }

    const row = hintCell.row;
    const col = hintCell.col;

    userBoard[row][col] = solutionBoard[row][col];
    puzzleBoard[row][col] = solutionBoard[row][col];

    selectedRow = row;
    selectedCol = col;
    selectedNumber = solutionBoard[row][col];

    hintsLeft--;
    hintsUsedCount++;

    updateHintsCounter();

    sudokuMessage.textContent = t("message.sudoku.hintUsed");

    updateNumberButtons();
    drawSudokuBoard();
    checkSudokuWin();
}

function updateHintsCounter() {
    sudokuHintsElement.textContent = hintsLeft + "/" + maxHints;
}

function checkSudokuWin() {
    if (gameOver) {
        return;
    }

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (userBoard[row][col] !== solutionBoard[row][col]) {
                return;
            }
        }
    }

    endSudokuGame(true);
}

function endSudokuGame(win) {
    if (gameOver && resultSaved) {
        return;
    }

    gameOver = true;

    if (win) {
        sudokuMessage.textContent = t("message.sudoku.win");
        saveSudokuResult("win");
    } else {
        sudokuMessage.textContent = t("message.sudoku.gameOver");
        saveSudokuResult("lose");
    }
}

function handleKeyboardInput(event) {
    if (gameOver) {
        return;
    }

    if (event.key >= "1" && event.key <= "9") {
        selectedNumber = Number(event.key);
        updateNumberButtons();
        fillSelectedCell(Number(event.key));
    }

    if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        eraseSelectedCell();
    }
}

function updateNumberButtons() {
    numberButtons.forEach(function(button) {
        const number = Number(button.dataset.number);
        const completed = isNumberCompleted(number);

        if (completed) {
            button.disabled = true;
            button.classList.add("disabled-number");
            button.classList.remove("active-number");
        } else {
            button.disabled = false;
            button.classList.remove("disabled-number");

            if (number === selectedNumber) {
                button.classList.add("active-number");
            } else {
                button.classList.remove("active-number");
            }
        }
    });
}

function isNumberCompleted(number) {
    let count = 0;

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (
                userBoard[row][col] === number &&
                solutionBoard[row][col] === number
            ) {
                count++;
            }
        }
    }

    return count >= 9;
}

function getHighlightNumber() {
    if (selectedNumber !== null) {
        return selectedNumber;
    }

    if (
        selectedRow !== null &&
        selectedCol !== null &&
        userBoard[selectedRow][selectedCol] !== 0
    ) {
        return userBoard[selectedRow][selectedCol];
    }

    return null;
}

function isConflictSource(row, col, targetRow, targetCol, number) {
    if (row === targetRow && col === targetCol) {
        return false;
    }

    if (userBoard[row][col] !== number) {
        return false;
    }

    return (
        row === targetRow ||
        col === targetCol ||
        isSameBox(row, col, targetRow, targetCol)
    );
}

function cannotPlaceNumber(row, col, number) {
    for (let c = 0; c < 9; c++) {
        if (userBoard[row][c] === number) {
            return true;
        }
    }

    for (let r = 0; r < 9; r++) {
        if (userBoard[r][col] === number) {
            return true;
        }
    }

    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;

    for (let r = startRow; r < startRow + 3; r++) {
        for (let c = startCol; c < startCol + 3; c++) {
            if (userBoard[r][c] === number) {
                return true;
            }
        }
    }

    return false;
}

function isSameBox(row1, col1, row2, col2) {
    return (
        Math.floor(row1 / 3) === Math.floor(row2 / 3) &&
        Math.floor(col1 / 3) === Math.floor(col2 / 3)
    );
}

function generateSolvedBoard() {
    const board = createEmptyBoard();
    fillBoard(board);
    return board;
}

function createEmptyBoard() {
    const board = [];

    for (let row = 0; row < 9; row++) {
        board[row] = [];

        for (let col = 0; col < 9; col++) {
            board[row][col] = 0;
        }
    }

    return board;
}

function fillBoard(board) {
    const emptyCell = findEmptyCell(board);

    if (emptyCell === null) {
        return true;
    }

    const row = emptyCell.row;
    const col = emptyCell.col;
    const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (let i = 0; i < numbers.length; i++) {
        const number = numbers[i];

        if (isValidNumber(board, row, col, number)) {
            board[row][col] = number;

            if (fillBoard(board)) {
                return true;
            }

            board[row][col] = 0;
        }
    }

    return false;
}

function findEmptyCell(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                return {
                    row: row,
                    col: col
                };
            }
        }
    }

    return null;
}

function isValidNumber(board, row, col, number) {
    for (let c = 0; c < 9; c++) {
        if (board[row][c] === number) {
            return false;
        }
    }

    for (let r = 0; r < 9; r++) {
        if (board[r][col] === number) {
            return false;
        }
    }

    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;

    for (let r = startRow; r < startRow + 3; r++) {
        for (let c = startCol; c < startCol + 3; c++) {
            if (board[r][c] === number) {
                return false;
            }
        }
    }

    return true;
}

function createPuzzleFromSolution(solution, removeCells) {
    const puzzle = copyBoard(solution);
    let positions = [];

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            positions.push({
                row: row,
                col: col
            });
        }
    }

    positions = shuffleArray(positions);

    for (let i = 0; i < removeCells; i++) {
        const position = positions[i];
        puzzle[position.row][position.col] = 0;
    }

    return puzzle;
}

function copyBoard(sourceBoard) {
    return sourceBoard.map(function(row) {
        return row.slice();
    });
}

function shuffleArray(array) {
    const result = array.slice();

    for (let i = result.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));

        const temp = result[i];
        result[i] = result[randomIndex];
        result[randomIndex] = temp;
    }

    return result;
}

async function saveSudokuResult(result) {
    if (resultSaved) {
        return;
    }

    if (!window.gameApi || !window.gameApi.getAuthToken()) {
        return;
    }

    resultSaved = true;

    try {
        await window.gameApi.saveGameResult("Sudoku", result, 0, {
            difficulty: currentDifficulty,
            mistakes: mistakesCount,
            hintsUsed: hintsUsedCount,
            livesLeft: lives
        });
    } catch (error) {
        console.error("Помилка збереження результату Sudoku:", error);
    }
}