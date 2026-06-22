"use strict";

const translations = {
    uk: {
        "nav.search": "Пошук гри...",
        "nav.login": "Увійти",
        "nav.gameTypes": "Типи ігор",
        "nav.allGames": "Усі ігри",
        "nav.numberGames": "Числові",
        "nav.boardGames": "Настільні",
        "nav.logicGames": "Головоломки",
        "nav.cardGames": "Карткові",

        "main.title": "Інтерактивна колекція логічних ігор",

        "main.2048.title": "2048",
        "main.tictactoe.title": "Хрестики-нулики",
        "main.sudoku.title": "Судоку",
        "main.solitaire.title": "Пасьянс",
        "main.minesweeper.title": "Сапер",
        "main.chess.title": "Шахи",
        "main.checkers.title": "Шашки",

        "main.2048.desc": "Об’єднуй плитки та набери 2048",
        "main.tictactoe.desc": "Постав три символи в один ряд",
        "main.sudoku.desc": "Заповни поле числами без повторів",
        "main.solitaire.desc": "Розклади карти у правильному порядку",
        "main.minesweeper.desc": "Відкрий поле та уникай мін",
        "main.chess.desc": "Продумуй ходи та постав мат",
        "main.checkers.desc": "Захоплюй шашки суперника",

        "button.newGame": "Нова гра",
        "button.restart": "Почати спочатку",
        "button.hint": "Підказка",
        "button.check": "Перевірити",
        "button.undo": "Відмінити хід",

        "game.score": "Рахунок:",
        "game.rules": "Правила гри",
        "game.mode": "Режим гри:",
        "game.twoPlayers": "2 гравці",
        "game.ai": "Проти ШІ",
        "game.currentPlayer": "Хід гравця:",
        "game.difficulty": "Складність:",
        "game.easy": "Легка",
        "game.medium": "Середня",
        "game.hard": "Складна",

        "game.2048.title": "Гра 2048",
        "game.2048.desc": "Об’єднуйте однакові числа та спробуйте отримати плитку 2048.",

        "game.tictactoe.title": "Гра Хрестики-нулики",
        "game.tictactoe.desc": "Класична гра для двох гравців або проти ШІ.",
        
        "game.minesweeper.title": "Гра Сапер",
        "game.minesweeper.desc": "Відкривайте клітинки та уникайте мін.",
        "game.field": "Поле:",
        "game.mines": "Міни:",
        "game.minesweeper.hint": "Ліва кнопка миші — відкрити клітинку. Права кнопка миші — поставити прапорець.",

        "difficulty.easy.minesweeper": "10×10 / 10 мін",
        "difficulty.medium.minesweeper": "15×15 / 35 мін",
        "difficulty.hard.minesweeper": "20×20 / 80 мін",

        "game.sudoku.title": "Гра Судоку",
        "game.sudoku.desc": "Заповніть поле числами від 1 до 9 так, щоб вони не повторювалися.",
        "game.lives": "Життя:",

        "difficulty.easy.sudoku": "45 відкритих / 5 життів",
        "difficulty.medium.sudoku": "35 відкритих / 4 життя",
        "difficulty.hard.sudoku": "25 відкритих / 3 життя",

        "game.checkers.title": "Гра Шашки",
        "game.checkers.desc": "Захоплюйте шашки суперника та доведіть свою стратегію до перемоги.",
        "game.checkers.white": "Світлі",
        "game.checkers.black": "Темні",
        "game.checkers.whitePieces": "Світлі:",
        "game.checkers.blackPieces": "Темні:",

        "game.chess.title": "Гра Шахи",
        "game.chess.desc": "Продумуйте ходи, захищайте короля та перемагайте суперника.",
        "game.chess.white": "Білі",
        "game.chess.black": "Чорні",

        "difficulty.chess.easy": "Легка (300 ELO)",
        "difficulty.chess.medium": "Середня (650 ELO)",
        "difficulty.chess.hard": "Складна (1000 ELO)",
        "difficulty.chess.expert": "Експерт (2000 ELO)",

        "game.solitaire.title": "Гра Пасьянс",
        "game.solitaire.desc": "Розкладайте карти за мастями від туза до короля.",
        "game.solitaire.stock": "Колода:",
        "game.solitaire.waste": "Скидання:",

        "difficulty.solitaire.easy": "Легка",
        "difficulty.solitaire.hard": "Складна",

        "game.inDevelopment": "Гра ще в розробці",
        "game.inDevelopmentText": "На цій сторінці буде реалізована логіка гри.",

        "rules.2048": "У грі 2048 потрібно об’єднувати однакові плитки, щоб отримати плитку 2048.",
        "rules.tictactoe": "Гравці по черзі ставлять символи X та O на полі 3×3. Перемагає той, хто першим поставить три свої символи в ряд.",
        "rules.minesweeper": "У грі Сапер потрібно відкрити всі безпечні клітинки на полі. Якщо гравець відкриває клітинку з міною — гра завершується поразкою.",
        "rules.sudoku": "У грі Судоку потрібно заповнити поле 9×9 числами від 1 до 9. У кожному рядку, стовпці та квадраті 3×3 числа не повинні повторюватися.",
        "rules.checkers": "У грі шашки гравці по черзі пересувають фігури по діагоналі темними клітинками. Якщо поруч є шашка суперника і за нею вільна клітинка, її можна побити. Перемагає той, хто забере всі шашки суперника або заблокує його ходи.",
        "rules.chess": "У грі шахи гравці по черзі пересувають фігури по дошці 8×8. Кожна фігура має власні правила руху. Мета гри — поставити мат королю суперника.",
        "rules.solitaire": "У пасьянсі потрібно перенести всі карти в бази мастей від туза до короля. У колонках карти розкладаються за спаданням і з чергуванням кольорів.",

        "message.2048.win": "Вітаємо! Ви отримали плитку 2048!",
        "message.2048.gameOver": "Гру завершено! Ходів більше немає.",

        "message.tictactoe.playerWin": "Переміг гравець {player}!",
        "message.tictactoe.aiWin": "Переміг ШІ!",
        "message.tictactoe.draw": "Нічия!",

        "message.minesweeper.win": "Вітаємо! Ви перемогли!",
        "message.minesweeper.lose": "Ви натрапили на міну! Гру завершено.",
        "message.minesweeper.firstMove": "Спочатку відкрийте першу клітинку.",

        "message.sudoku.selectCell": "Спочатку оберіть клітинку.",
        "message.sudoku.fixedCell": "Початкові клітинки змінювати не можна.",
        "message.sudoku.correct": "Правильно.",
        "message.sudoku.wrong": "Неправильно. Залишилось життів: {lives}",
        "message.sudoku.gameOver": "Гру завершено. Спроби закінчилися.",
        "message.sudoku.win": "Вітаємо! Судоку розв’язано правильно.",
        "message.sudoku.restart": "Поле почато спочатку.",
        "message.sudoku.hintsOver": "Підказки закінчилися.",
        "message.sudoku.hintUsed": "Підказку використано.",
        "message.sudoku.allFilled": "Усі клітинки вже заповнені.",
        "message.sudoku.hasMistakes": "Є помилки. Вони підсвічені червоним.",
        "message.sudoku.hasEmpty": "Ще не всі клітинки заповнені.",

        "message.checkers.mustCapture": "Потрібно бити шашку суперника.",
        "message.checkers.noMovesForPiece": "Для цієї шашки немає доступних ходів.",
        "message.checkers.continueCapture": "Можна продовжити взяття.",
        "message.checkers.aiThinking": "ШІ обирає хід...",
        "message.checkers.win": "Переміг гравець: {player}!",

        "message.chess.noMovesForPiece": "Для цієї фігури немає доступних ходів.",
        "message.chess.pawnPromoted": "Пішак перетворився на ферзя.",
        "message.chess.check": "Шах королю гравця: {player}.",
        "message.chess.checkmate": "Мат! Переміг гравець: {player}!",
        "message.chess.stalemate": "Пат! Нічия.",
        "message.chess.aiThinking": "ШІ обирає хід...",
        "message.chess.win": "Переміг гравець: {player}!",

        "message.solitaire.selectCard": "Спочатку оберіть карту.",
        "message.solitaire.invalidMove": "Цей хід неможливий.",
        "message.solitaire.onlyOneCardFoundation": "У базу масті можна переносити тільки одну карту.",
        "message.solitaire.stockRecycled": "Карти зі скидання повернено в колоду.",
        "message.solitaire.stockEmpty": "Колода порожня.",
        "message.solitaire.win": "Вітаємо! Пасьянс складено.",
        "message.solitaire.noUndo": "Немає ходу для відміни.",
        "message.solitaire.undoDone": "Останній хід відмінено.",
        "message.solitaire.autoDone": "Карту переміщено.",
        "message.solitaire.noAutoMoves": "Немає доступного автоматичного ходу.",
        "message.solitaire.autoDisabled": "Автоперенесення доступне тільки на легкому рівні.",
        "profile.pageTitle": "Профіль користувача",
        "profile.title": "Профіль користувача",
        "profile.description": "Перегляд акаунту та досягнень в іграх.",
        "profile.logout": "Вийти",
        "profile.accountInfo": "Інформація про акаунт",
        "profile.username": "Ім’я користувача:",
        "profile.achievements": "Досягнення",
        "profile.sessionExpired": "Сесію завершено. Увійдіть повторно.",

        "profile.stat.games": "Ігор:",
        "profile.stat.wins": "Перемог:",
        "profile.stat.losses": "Поразок:",
        "profile.stat.score": "Рахунок:",
        "profile.stat.draws": "Нічиї:",
        "profile.stat.solved": "Розв’язано:",
        "profile.stat.failed": "Програно:",
        "profile.stat.perfect": "Без помилок:",
        "profile.stat.explosions": "Підривів:",
        "profile.stat.opened": "Відкрито:",
        "profile.stat.completed": "Складено:",
        "profile.stat.notCompleted": "Не складено:",
        "profile.stat.foundationCards": "Карт у базі:",
        "profile.stat.captured": "Побито:",
        "auth.title": "Вхід у систему",
        "auth.login": "Логін",
        "auth.loginPlaceholder": "Введіть логін",
        "auth.password": "Пароль",
        "auth.passwordPlaceholder": "Введіть пароль",
        "auth.loginButton": "Увійти",
        "auth.registerButton": "Зареєструватися",
    },

    en: {
        "nav.search": "Search game...",
        "nav.login": "Log in",
        "nav.gameTypes": "Game types",
        "nav.allGames": "All games",
        "nav.numberGames": "Number games",
        "nav.boardGames": "Board games",
        "nav.logicGames": "Puzzles",
        "nav.cardGames": "Card games",

        "main.title": "Interactive Collection of Logic Games",

        "main.2048.title": "2048",
        "main.tictactoe.title": "Tic-Tac-Toe",
        "main.sudoku.title": "Sudoku",
        "main.solitaire.title": "Solitaire",
        "main.minesweeper.title": "Minesweeper",
        "main.chess.title": "Chess",
        "main.checkers.title": "Checkers",

        "main.2048.desc": "Merge tiles and reach 2048",
        "main.tictactoe.desc": "Place three symbols in a row",
        "main.sudoku.desc": "Fill the grid without repeats",
        "main.solitaire.desc": "Arrange the cards in order",
        "main.minesweeper.desc": "Open cells and avoid mines",
        "main.chess.desc": "Plan moves and checkmate",
        "main.checkers.desc": "Capture your opponent’s pieces",

        "button.newGame": "New game",
        "button.restart": "Restart",
        "button.hint": "Hint",
        "button.check": "Check",
        "button.undo": "Undo move",

        "game.score": "Score:",
        "game.rules": "Game rules",
        "game.mode": "Game mode:",
        "game.twoPlayers": "2 players",
        "game.ai": "Against AI",
        "game.currentPlayer": "Current player:",
        "game.difficulty": "Difficulty:",
        "game.easy": "Easy",
        "game.medium": "Medium",
        "game.hard": "Hard",

        "game.2048.title": "2048 Game",
        "game.2048.desc": "Combine matching numbers and try to reach the 2048 tile.",

        "game.tictactoe.title": "Tic-Tac-Toe Game",
        "game.tictactoe.desc": "Classic Tic-Tac-Toe for two players or against AI.",

        "game.minesweeper.title": "Minesweeper Game",
        "game.minesweeper.desc": "Open cells and avoid mines.",
        "game.field": "Field:",
        "game.mines": "Mines:",
        "game.minesweeper.hint": "Left mouse button — open a cell. Right mouse button — place a flag.",

        "difficulty.easy.minesweeper": "10×10 / 10 mines",
        "difficulty.medium.minesweeper": "15×15 / 35 mines",
        "difficulty.hard.minesweeper": "20×20 / 80 mines",

        "game.sudoku.title": "Sudoku Game",
        "game.sudoku.desc": "Fill the grid with numbers from 1 to 9 without repeating them.",
        "game.lives": "Lives:",

        "difficulty.easy.sudoku": "45 opened / 5 lives",
        "difficulty.medium.sudoku": "35 opened / 4 lives",
        "difficulty.hard.sudoku": "25 opened / 3 lives",

        "game.checkers.title": "Checkers Game",
        "game.checkers.desc": "Capture your opponent’s pieces and use strategy to win.",
        "game.checkers.white": "White",
        "game.checkers.black": "Black",
        "game.checkers.whitePieces": "White:",
        "game.checkers.blackPieces": "Black:",

        "game.chess.title": "Chess Game",
        "game.chess.desc": "Plan your moves, protect your king, and defeat your opponent.",
        "game.chess.white": "White",
        "game.chess.black": "Black",

        "difficulty.chess.easy": "Easy (300 ELO)",
        "difficulty.chess.medium": "Medium (650 ELO)",
        "difficulty.chess.hard": "Hard (1000 ELO)",
        "difficulty.chess.expert": "Expert (2000 ELO)",

        "game.solitaire.title": "Solitaire Game",
        "game.solitaire.desc": "Arrange cards by suits from ace to king.",
        "game.solitaire.stock": "Stock:",
        "game.solitaire.waste": "Waste:",

        "difficulty.solitaire.easy": "Easy",
        "difficulty.solitaire.hard": "Hard",

        "game.inDevelopment": "Game in development",
        "game.inDevelopmentText": "The game logic will be implemented on this page.",

        "rules.2048": "In 2048, you need to combine matching tiles to reach the 2048 tile.",
        "rules.tictactoe": "Players take turns placing X and O on a 3×3 board. The first player to place three symbols in a row wins.",
        "rules.minesweeper": "In Minesweeper, you need to open all safe cells. If the player opens a mine, the game is lost.",
        "rules.sudoku": "In Sudoku, you need to fill a 9×9 grid with numbers from 1 to 9. Numbers must not repeat in any row, column, or 3×3 box.",
        "rules.checkers": "In Checkers, players move pieces diagonally on dark squares. If an opponent’s piece is next to a player’s piece and the square behind it is empty, it can be captured. The winner is the player who captures all opponent pieces or blocks all opponent moves.",
        "rules.chess": "In Chess, players take turns moving pieces on an 8×8 board. Each piece has its own movement rules. The goal is to checkmate the opponent’s king.",
        "rules.solitaire": "In Solitaire, you need to move all cards to the suit foundations from ace to king. In the tableau, cards are arranged in descending order with alternating colors.",

        "message.2048.win": "Congratulations! You reached the 2048 tile!",
        "message.2048.gameOver": "Game over! No moves left.",

        "message.tictactoe.playerWin": "Player {player} wins!",
        "message.tictactoe.aiWin": "AI wins!",
        "message.tictactoe.draw": "Draw!",

        "message.minesweeper.win": "Congratulations! You won!",
        "message.minesweeper.lose": "You hit a mine! Game over.",
        "message.minesweeper.firstMove": "Open the first cell first.",

        "message.sudoku.selectCell": "Select a cell first.",
        "message.sudoku.fixedCell": "Initial cells cannot be changed.",
        "message.sudoku.correct": "Correct.",
        "message.sudoku.wrong": "Wrong. Lives left: {lives}",
        "message.sudoku.gameOver": "Game over. No attempts left.",
        "message.sudoku.win": "Congratulations! Sudoku solved correctly.",
        "message.sudoku.restart": "The same puzzle has been restarted.",
        "message.sudoku.hintsOver": "No hints left.",
        "message.sudoku.hintUsed": "Hint used.",
        "message.sudoku.allFilled": "All cells are already filled.",
        "message.sudoku.hasMistakes": "There are mistakes. They are highlighted in red.",
        "message.sudoku.hasEmpty": "Some cells are still empty.",

        "message.checkers.mustCapture": "You must capture an opponent’s piece.",
        "message.checkers.noMovesForPiece": "This piece has no available moves.",
        "message.checkers.continueCapture": "You can continue capturing.",
        "message.checkers.aiThinking": "AI is choosing a move...",
        "message.checkers.win": "Winner: {player}!",

        "message.chess.noMovesForPiece": "This piece has no available moves.",
        "message.chess.pawnPromoted": "The pawn has been promoted to a queen.",
        "message.chess.check": "{player} king is in check.",
        "message.chess.checkmate": "Checkmate! Winner: {player}!",
        "message.chess.stalemate": "Stalemate! Draw.",
        "message.chess.aiThinking": "AI is choosing a move...",
        "message.chess.win": "Winner: {player}!",

        "message.solitaire.selectCard": "Select a card first.",
        "message.solitaire.invalidMove": "This move is not allowed.",
        "message.solitaire.onlyOneCardFoundation": "Only one card can be moved to a foundation.",
        "message.solitaire.stockRecycled": "Waste cards have been returned to the stock.",
        "message.solitaire.stockEmpty": "The stock is empty.",
        "message.solitaire.win": "Congratulations! Solitaire completed.",
        "message.solitaire.noUndo": "There is no move to undo.",
        "message.solitaire.undoDone": "The last move has been undone.",
        "message.solitaire.autoDone": "Card moved.",
        "message.solitaire.noAutoMoves": "There is no available automatic move.",
        "message.solitaire.autoDisabled": "Auto-moving is available only on Easy difficulty.",
        "profile.pageTitle": "User Profile",
        "profile.title": "User Profile",
        "profile.description": "View your account and game achievements.",
        "profile.logout": "Log out",
        "profile.accountInfo": "Account information",
        "profile.username": "Username:",
        "profile.achievements": "Achievements",
        "profile.sessionExpired": "Session expired. Please log in again.",

        "profile.stat.games": "Games:",
        "profile.stat.wins": "Wins:",
        "profile.stat.losses": "Losses:",
        "profile.stat.score": "Score:",
        "profile.stat.draws": "Draws:",
        "profile.stat.solved": "Solved:",
        "profile.stat.failed": "Failed:",
        "profile.stat.perfect": "Perfect:",
        "profile.stat.explosions": "Explosions:",
        "profile.stat.opened": "Opened:",
        "profile.stat.completed": "Completed:",
        "profile.stat.notCompleted": "Not completed:",
        "profile.stat.foundationCards": "Foundation cards:",
        "profile.stat.captured": "Captured:",
        "auth.title": "Sign in",
        "auth.login": "Login",
        "auth.loginPlaceholder": "Enter login",
        "auth.password": "Password",
        "auth.passwordPlaceholder": "Enter password",
        "auth.loginButton": "Sign in",
        "auth.registerButton": "Register",
    }
};

function getCurrentLanguage() {
    return localStorage.getItem("siteLanguage") || "uk";
}

function setLanguage(language) {
    localStorage.setItem("siteLanguage", language);
    applyTranslations(language);
}

function translate(key) {
    const language = getCurrentLanguage();

    if (translations[language] && translations[language][key]) {
        return translations[language][key];
    }

    return key;
}

function applyTranslations(language) {
    document.querySelectorAll("[data-i18n]").forEach(function(element) {
        const key = element.dataset.i18n;

        if (translations[language] && translations[language][key]) {
            element.textContent = translations[language][key];
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function(element) {
        const key = element.dataset.i18nPlaceholder;

        if (translations[language] && translations[language][key]) {
            element.placeholder = translations[language][key];
        }
    });

    document.querySelectorAll(".language-select").forEach(function(select) {
        select.value = language;
    });

    document.documentElement.lang = language;
}

document.addEventListener("DOMContentLoaded", function() {
    const language = getCurrentLanguage();

    document.querySelectorAll(".language-select").forEach(function(select) {
        select.value = language;

        select.addEventListener("change", function() {
            setLanguage(select.value);
        });
    });

    applyTranslations(language);
});

window.translate = translate;
window.setLanguage = setLanguage;
window.getCurrentLanguage = getCurrentLanguage;