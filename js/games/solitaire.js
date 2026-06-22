"use strict";

const stockPileElement = document.getElementById("stockPile");
const wastePileElement = document.getElementById("wastePile");
const foundationPileElements = document.querySelectorAll(".foundation-pile");
const tableauColumns = document.querySelectorAll(".tableau-column");
const solitaireMessage = document.getElementById("solitaireMessage");
const restartSolitaireButton = document.getElementById("restartSolitaire");
const undoSolitaireButton = document.getElementById("undoSolitaire");
const solitaireDifficultyButtons = document.querySelectorAll(".solitaire-difficulty-btn");
const stockCountElement = document.getElementById("stockCount");
const wasteCountElement = document.getElementById("wasteCount");

const suits = ["hearts", "diamonds", "clubs", "spades"];

const suitSymbols = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠"
};

const suitColors = {
    hearts: "red",
    diamonds: "red",
    clubs: "black",
    spades: "black"
};

const rankNames = {
    1: "A",
    11: "J",
    12: "Q",
    13: "K"
};

const difficultySettings = {
    easy: {
        drawCount: 1,
        autoPlace: true
    },
    hard: {
        drawCount: 3,
        autoPlace: false
    }
};

let currentDifficulty = "easy";

let stock = [];
let waste = [];
let foundations = {};
let tableau = [];
let selected = null;
let moveHistory = [];
let resultSaved = false;
let gameStarted = false;

let currentMessageKey = "";
let currentMessageValues = {};

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
    !stockPileElement ||
    !wastePileElement ||
    foundationPileElements.length === 0 ||
    tableauColumns.length === 0 ||
    !solitaireMessage ||
    !restartSolitaireButton ||
    !undoSolitaireButton ||
    solitaireDifficultyButtons.length === 0 ||
    !stockCountElement ||
    !wasteCountElement
) {
    console.error("Помилка: не знайдено один або кілька HTML-елементів для Solitaire.");
} else {
    restartSolitaireButton.addEventListener("click", startSolitaire);
    undoSolitaireButton.addEventListener("click", undoLastMove);
    stockPileElement.addEventListener("click", drawFromStock);

    solitaireDifficultyButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            solitaireDifficultyButtons.forEach(function(btn) {
                btn.classList.remove("active-difficulty");
            });

            button.classList.add("active-difficulty");
            currentDifficulty = button.dataset.difficulty;
            window.addEventListener("resize", function() {
                renderSolitaire();
            });
            startSolitaire();
        });
    });

    foundationPileElements.forEach(function(pile) {
        pile.addEventListener("click", function() {
            tryMoveSelectedToFoundation(pile.dataset.suit);
        });
    });

    tableauColumns.forEach(function(column) {
        column.addEventListener("click", function() {
            const columnIndex = Number(column.dataset.column);
            tryMoveSelectedToTableau(columnIndex);
        });
    });

    document.querySelectorAll(".language-select").forEach(function(select) {
        select.addEventListener("change", function() {
            setTimeout(function() {
                renderCurrentMessage();
            }, 0);
        });
    });

    startSolitaire();
}

function startSolitaire() {
    if (gameStarted && !resultSaved) {
    saveSolitaireResult("lose");
    }
    stock = [];
    waste = [];
    foundations = {
        hearts: [],
        diamonds: [],
        clubs: [],
        spades: []
    };
    tableau = [[], [], [], [], [], [], []];
    selected = null;
    moveHistory = [];

    resultSaved = false;
    gameStarted = true;

    const deck = shuffleArray(createDeck());

    dealCards(deck);

    clearMessage();
    renderSolitaire();
}

function createDeck() {
    const deck = [];
    let id = 1;

    for (let i = 0; i < suits.length; i++) {
        const suit = suits[i];

        for (let rank = 1; rank <= 13; rank++) {
            deck.push({
                id: id,
                suit: suit,
                rank: rank,
                color: suitColors[suit],
                faceUp: false
            });

            id++;
        }
    }

    return deck;
}

function dealCards(deck) {
    for (let column = 0; column < 7; column++) {
        for (let count = 0; count <= column; count++) {
            const card = deck.pop();

            if (count === column) {
                card.faceUp = true;
            }

            tableau[column].push(card);
        }
    }

    stock = deck;
}

function drawFromStock() {
    selected = null;

    const drawCount = difficultySettings[currentDifficulty].drawCount;

    if (stock.length > 0) {
        saveState();

        const cardsToDraw = Math.min(drawCount, stock.length);

        for (let i = 0; i < cardsToDraw; i++) {
            const card = stock.pop();

            card.faceUp = true;
            waste.push(card);
        }

        clearMessage();

        renderSolitaire();
        return;
    }

    if (waste.length > 0) {
        saveState();

        stock = waste.reverse();

        for (let i = 0; i < stock.length; i++) {
            stock[i].faceUp = false;
        }

        waste = [];

        showMessage("message.solitaire.stockRecycled");
        renderSolitaire();
        return;
    }

    showMessage("message.solitaire.stockEmpty");
    renderSolitaire();
}

function renderSolitaire() {
    renderStock();
    renderWaste();
    renderFoundations();
    renderTableau();
    updateCounters();
    checkWin();
}

function renderStock() {
    stockPileElement.innerHTML = "";

    if (stock.length > 0) {
        const backCard = createCardElement(null, true);
        stockPileElement.appendChild(backCard);
    } else {
        stockPileElement.innerHTML = '<span class="empty-pile-text">↻</span>';
    }
}

function renderWaste() {
    wastePileElement.innerHTML = "";

    if (waste.length === 0) {
        wastePileElement.innerHTML = '<span class="empty-pile-text">□</span>';
        return;
    }

    const topCard = waste[waste.length - 1];
    const cardElement = createCardElement(topCard, false);

    cardElement.addEventListener("click", function(event) {
        event.stopPropagation();
        selectWasteCard();
    });

    cardElement.addEventListener("dblclick", function(event) {
        event.stopPropagation();
        selectWasteCard();
        autoMoveSelectedToFoundation();
    });

    wastePileElement.appendChild(cardElement);
}

function renderFoundations() {
    foundationPileElements.forEach(function(pile) {
        const suit = pile.dataset.suit;
        const foundation = foundations[suit];

        pile.innerHTML = "";

        if (foundation.length === 0) {
            pile.innerHTML = '<span class="empty-pile-text">' + suitSymbols[suit] + '</span>';
            return;
        }

        const topCard = foundation[foundation.length - 1];
        const cardElement = createCardElement(topCard, false);

        pile.appendChild(cardElement);
    });
}

function renderTableau() {
    tableauColumns.forEach(function(columnElement) {
        const columnIndex = Number(columnElement.dataset.column);
        const columnCards = tableau[columnIndex];

        columnElement.innerHTML = "";

        const cardHeight = getSolitaireCssNumber("--card-height", 125);
        const cardOffset = getSolitaireCssNumber("--card-offset", 32);
        const tableMinHeight = getSolitaireCssNumber("--tableau-min-height", 460);

        const minHeight = Math.max(
            tableMinHeight,
            cardHeight + Math.max(0, columnCards.length - 1) * cardOffset
        );

        columnElement.style.minHeight = minHeight + "px";

        for (let i = 0; i < columnCards.length; i++) {
            const card = columnCards[i];
            const cardElement = createCardElement(card, !card.faceUp);

            cardElement.style.top = i * cardOffset + "px";

            if (card.faceUp) {
                cardElement.addEventListener("click", function(event) {
                    event.stopPropagation();
                    handleTableauCardClick(columnIndex, i);
                });

                cardElement.addEventListener("dblclick", function(event) {
                    event.stopPropagation();
                    selectTableauStack(columnIndex, i);
                    autoMoveSelectedToFoundation();
                });
            }

            columnElement.appendChild(cardElement);
        }
    });
}

function getSolitaireCssNumber(variableName, fallbackValue) {
    const solitaireArea = document.querySelector(".solitaire-area");

    if (!solitaireArea) {
        return fallbackValue;
    }

    const value = getComputedStyle(solitaireArea).getPropertyValue(variableName);
    const number = parseFloat(value);

    if (Number.isNaN(number)) {
        return fallbackValue;
    }

    return number;
}

function createCardElement(card, faceDown) {
    const cardElement = document.createElement("div");
    cardElement.classList.add("playing-card");

    if (faceDown) {
        cardElement.classList.add("face-down");
        return cardElement;
    }

    cardElement.classList.add(card.color);

    if (isCardSelected(card)) {
        cardElement.classList.add("selected");
    }

    const rank = getRankName(card.rank);
    const suit = suitSymbols[card.suit];

    cardElement.innerHTML =
        '<div class="card-top">' + rank + suit + '</div>' +
        '<div class="card-center">' + suit + '</div>' +
        '<div class="card-bottom">' + rank + suit + '</div>';

    return cardElement;
}

function handleTableauCardClick(columnIndex, cardIndex) {
    if (selected !== null && tryMoveSelectedToTableau(columnIndex)) {
        return;
    }

    if (tryAutoMoveTableauCardToFoundation(columnIndex, cardIndex)) {
        return;
    }

    if (tryAutoMoveTableauStackToAnotherColumn(columnIndex, cardIndex)) {
        return;
    }

    selectTableauStack(columnIndex, cardIndex);
}

function selectWasteCard() {
    if (waste.length === 0) {
        return;
    }

    if (tryAutoMoveWasteCardToFoundation()) {
        return;
    }

    if (tryAutoMoveWasteCardToTableau()) {
        return;
    }

    const topCard = waste[waste.length - 1];

    selected = {
        source: "waste",
        cards: [topCard]
    };

    clearMessage();
    renderSolitaire();
}

function selectTableauStack(columnIndex, cardIndex) {
    const card = tableau[columnIndex][cardIndex];

    if (!card || !card.faceUp) {
        return;
    }

    selected = {
        source: "tableau",
        column: columnIndex,
        index: cardIndex,
        cards: tableau[columnIndex].slice(cardIndex)
    };

    clearMessage();
    renderSolitaire();
}

function tryMoveSelectedToFoundation(suit) {
    if (selected === null) {
        showMessage("message.solitaire.selectCard");
        return false;
    }

    if (selected.cards.length !== 1) {
        showMessage("message.solitaire.onlyOneCardFoundation");
        return false;
    }

    const card = selected.cards[0];

    if (!canMoveToFoundation(card, suit)) {
        showMessage("message.solitaire.invalidMove");
        return false;
    }

    saveState();

    removeSelectedCardsFromSource();
    foundations[suit].push(card);

    selected = null;
    clearMessage();

    renderSolitaire();

    return true;
}

function tryMoveSelectedToTableau(columnIndex) {
    if (selected === null) {
        return false;
    }

    if (selected.source === "tableau" && selected.column === columnIndex) {
        return false;
    }

    if (!canMoveStackToTableau(selected.cards, columnIndex)) {
        showMessage("message.solitaire.invalidMove");
        return false;
    }

    saveState();

    removeSelectedCardsFromSource();

    for (let i = 0; i < selected.cards.length; i++) {
        tableau[columnIndex].push(selected.cards[i]);
    }

    selected = null;
    clearMessage();

    renderSolitaire();

    return true;
}

function tryAutoMoveWasteCardToFoundation() {
    if (!difficultySettings[currentDifficulty].autoPlace) {
        return false;
    }

    if (waste.length === 0) {
        return false;
    }

    const card = waste[waste.length - 1];

    if (!canMoveToFoundation(card, card.suit)) {
        return false;
    }

    saveState();

    waste.pop();
    foundations[card.suit].push(card);

    selected = null;
    showMessage("message.solitaire.autoDone");
    renderSolitaire();

    return true;
}

function tryAutoMoveTableauCardToFoundation(columnIndex, cardIndex) {
    if (!difficultySettings[currentDifficulty].autoPlace) {
        return false;
    }

    const column = tableau[columnIndex];

    if (column.length === 0) {
        return false;
    }

    /*
        Автопідстановка працює тільки для верхньої карти колонки.
        Не для всієї стопки.
    */
    if (cardIndex !== column.length - 1) {
        return false;
    }

    const card = column[cardIndex];

    if (!card.faceUp) {
        return false;
    }

    if (!canMoveToFoundation(card, card.suit)) {
        return false;
    }

    saveState();

    column.pop();
    foundations[card.suit].push(card);

    revealTopCard(columnIndex);

    selected = null;
    showMessage("message.solitaire.autoDone");
    renderSolitaire();

    return true;
}

function tryAutoMoveWasteCardToTableau() {
    if (!difficultySettings[currentDifficulty].autoPlace) {
        return false;
    }

    if (waste.length === 0) {
        return false;
    }

    const card = waste[waste.length - 1];
    const targetColumnIndex = findTableauColumnForCards([card], null);

    if (targetColumnIndex === null) {
        return false;
    }

    saveState();

    waste.pop();
    tableau[targetColumnIndex].push(card);

    selected = null;
    showMessage("message.solitaire.autoDone");
    renderSolitaire();

    return true;
}

function tryAutoMoveTableauStackToAnotherColumn(columnIndex, cardIndex) {
    if (!difficultySettings[currentDifficulty].autoPlace) {
        return false;
    }

    const column = tableau[columnIndex];

    if (column.length === 0) {
        return false;
    }

    const card = column[cardIndex];

    if (!card || !card.faceUp) {
        return false;
    }

    const cardsToMove = column.slice(cardIndex);
    const targetColumnIndex = findTableauColumnForCards(cardsToMove, columnIndex);

    if (targetColumnIndex === null) {
        return false;
    }

    saveState();

    tableau[columnIndex].splice(cardIndex);

    for (let i = 0; i < cardsToMove.length; i++) {
        tableau[targetColumnIndex].push(cardsToMove[i]);
    }

    revealTopCard(columnIndex);

    selected = null;
    showMessage("message.solitaire.autoDone");
    renderSolitaire();

    return true;
}

function findTableauColumnForCards(cards, sourceColumnIndex) {
    for (let columnIndex = 0; columnIndex < tableau.length; columnIndex++) {
        if (columnIndex === sourceColumnIndex) {
            continue;
        }

        if (canMoveStackToTableau(cards, columnIndex)) {
            return columnIndex;
        }
    }

    return null;
}

function autoMoveSelectedToFoundation() {
    if (selected === null || selected.cards.length !== 1) {
        return;
    }

    const card = selected.cards[0];

    for (let i = 0; i < suits.length; i++) {
        const suit = suits[i];

        if (canMoveToFoundation(card, suit)) {
            tryMoveSelectedToFoundation(suit);
            return;
        }
    }

    showMessage("message.solitaire.invalidMove");
}

function canMoveToFoundation(card, suit) {
    if (card.suit !== suit) {
        return false;
    }

    const foundation = foundations[suit];

    if (foundation.length === 0) {
        return card.rank === 1;
    }

    const topCard = foundation[foundation.length - 1];

    return card.rank === topCard.rank + 1;
}

function canMoveStackToTableau(cards, columnIndex) {
    if (cards.length === 0) {
        return false;
    }

    const firstCard = cards[0];
    const targetColumn = tableau[columnIndex];

    if (targetColumn.length === 0) {
        return firstCard.rank === 13;
    }

    const targetCard = targetColumn[targetColumn.length - 1];

    if (!targetCard.faceUp) {
        return false;
    }

    return (
        firstCard.color !== targetCard.color &&
        firstCard.rank === targetCard.rank - 1
    );
}

function removeSelectedCardsFromSource() {
    if (selected.source === "waste") {
        waste.pop();
        return;
    }

    if (selected.source === "tableau") {
        const columnIndex = selected.column;

        tableau[columnIndex].splice(selected.index);
        revealTopCard(columnIndex);
    }
}

function revealTopCard(columnIndex) {
    const column = tableau[columnIndex];

    if (column.length === 0) {
        return;
    }

    const topCard = column[column.length - 1];

    if (!topCard.faceUp) {
        topCard.faceUp = true;
    }
}

/* ===== Відміна останнього ходу ===== */

function saveState() {
    moveHistory.push({
        stock: cloneCardArray(stock),
        waste: cloneCardArray(waste),
        foundations: cloneFoundations(foundations),
        tableau: cloneTableau(tableau),
        messageKey: currentMessageKey,
        messageValues: Object.assign({}, currentMessageValues)
    });
}

function undoLastMove() {
    if (moveHistory.length === 0) {
        showMessage("message.solitaire.noUndo");
        return;
    }

    const lastState = moveHistory.pop();

    stock = cloneCardArray(lastState.stock);
    waste = cloneCardArray(lastState.waste);
    foundations = cloneFoundations(lastState.foundations);
    tableau = cloneTableau(lastState.tableau);

    selected = null;

    currentMessageKey = "";
    currentMessageValues = {};

    showMessage("message.solitaire.undoDone");
    renderSolitaire();
}

function cloneCard(card) {
    return {
        id: card.id,
        suit: card.suit,
        rank: card.rank,
        color: card.color,
        faceUp: card.faceUp
    };
}

function cloneCardArray(cards) {
    return cards.map(function(card) {
        return cloneCard(card);
    });
}

function cloneFoundations(sourceFoundations) {
    return {
        hearts: cloneCardArray(sourceFoundations.hearts),
        diamonds: cloneCardArray(sourceFoundations.diamonds),
        clubs: cloneCardArray(sourceFoundations.clubs),
        spades: cloneCardArray(sourceFoundations.spades)
    };
}

function cloneTableau(sourceTableau) {
    return sourceTableau.map(function(column) {
        return cloneCardArray(column);
    });
}

/* ===== Інше ===== */

function isCardSelected(card) {
    if (selected === null || card === null) {
        return false;
    }

    for (let i = 0; i < selected.cards.length; i++) {
        if (selected.cards[i].id === card.id) {
            return true;
        }
    }

    return false;
}

function checkWin() {
    const won = suits.every(function(suit) {
        return foundations[suit].length === 13;
    });

    if (won) {
        showMessage("message.solitaire.win");
        saveSolitaireResult("win");
    }
}

function updateCounters() {
    stockCountElement.textContent = stock.length;
    wasteCountElement.textContent = waste.length;
}

function getRankName(rank) {
    if (rankNames[rank]) {
        return rankNames[rank];
    }

    return String(rank);
}

function showMessage(key, values) {
    currentMessageKey = key;
    currentMessageValues = values || {};

    renderCurrentMessage();
}

function clearMessage() {
    currentMessageKey = "";
    currentMessageValues = {};

    solitaireMessage.textContent = "";
}

function renderCurrentMessage() {
    if (currentMessageKey === "") {
        solitaireMessage.textContent = "";
        return;
    }

    solitaireMessage.textContent = formatText(t(currentMessageKey), currentMessageValues);
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

function countFoundationCards() {
    let total = 0;

    for (let i = 0; i < suits.length; i++) {
        total += foundations[suits[i]].length;
    }

    return total;
}

async function saveSolitaireResult(result) {
    if (resultSaved) {
        return;
    }

    if (!window.gameApi || !window.gameApi.getAuthToken()) {
        return;
    }

    resultSaved = true;

    try {
        await window.gameApi.saveGameResult("Solitaire", result, 0, {
            foundationCards: countFoundationCards(),
            stockCards: stock.length,
            wasteCards: waste.length
        });
    } catch (error) {
        console.error("Помилка збереження результату Solitaire:", error);
    }
}