const createElement = (tag, className, text = '') => {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text) {
        element.textContent = text;
    }

    return element;
};

// ===== HEADER =====

const header = createElement('header', 'header');

const title = createElement('h1', 'title', 'Memory Game');

const headerButtons = createElement('div', 'header-buttons');

const newGameButton = createElement('button', 'header-button', 'New Game');
newGameButton.addEventListener('click', () => {
    startNewGame();
})

const leaderboardButton = createElement(
    'button',
    'header-button',
    'Leaderboard',
);

headerButtons.append(newGameButton, leaderboardButton);
header.append(title, headerButtons);

// ===== MAIN =====

const main = createElement('main', 'main');

const gameInfo = createElement('div', 'game-info');

const movesContainer = createElement('div', 'counter');
const pairsContainer = createElement('div', 'counter');

const movesLabel = createElement('span', 'counter-label', 'Moves: ');
const pairsLabel = createElement('span', 'counter-label', 'Pairs: ');

const movesValue = createElement('span', 'counter-value', '0');
const pairsValue = createElement('span', 'counter-value', '0 / 8');

movesLabel.append(movesValue);
pairsLabel.append(pairsValue);

movesContainer.append(movesLabel);
pairsContainer.append(pairsLabel);

gameInfo.append(movesContainer, pairsContainer);

// ===== GAME BOARD =====

const gameBoard = createElement('section', 'game-board');

const cardImages = [
    '🍎',
    '🍌',
    '🍇',
    '🍉',
    '🍓',
    '🍒',
    '🥝',
    '🍍',
];

let cards = [];

let firstCard = null;
let secondCard = null;
let isLocked = false;
let moves = 0; 
let pairs = 0;
let mismatchTimer = null;

let gameFinished = false;
const STORAGE_KEY = 'memory-game-results';

const createCards = () => {
    const pairs = [...cardImages, ...cardImages];

    return pairs.map((image, index) => ({
        id: index,
        image,
        matched: false,
    }));
};

const shuffleCards = (cardsArray) => {
    const shuffled = [...cardsArray];

    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const randomIndex = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[randomIndex]] = [
            shuffled[randomIndex],
            shuffled[i],
        ];
    }

    return shuffled;
};

const createCard = (card) => {
    const cardElement = createElement('button', 'card');

    cardElement.type = 'button';
    cardElement.dataset.id = card.id;

    const cardFront = createElement('span', 'card-front', card.image);
    const cardBack = createElement('span', 'card-back', '?');

    cardElement.append(cardFront, cardBack);

    return cardElement;
};

const openCard = (cardElement, card) => {
    cardElement.classList.add('card-open');

    const cardFront = cardElement.querySelector('.card-front');
    const cardBack = cardElement.querySelector('.card-back');

    cardFront.style.opacity = '1';
    cardBack.style.opacity = '0';

    if (!firstCard) {
        firstCard = {
            element: cardElement,
            card,
        };

        return;
    }

    secondCard = {
        element: cardElement,
        card,
    };

    moves += 1;
    movesValue.textContent = moves;

    isLocked = true;

    checkCards();
};

const checkCards = () => {
    const isMatch = firstCard.card.image === secondCard.card.image;

    if (isMatch) {
    firstCard.card.matched = true;
    secondCard.card.matched = true;

    pairs += 1;
    pairsValue.textContent = `${pairs} / 8`;

    firstCard = null;
    secondCard = null;
    isLocked = false;

    if (pairs === 8) {
        finishGame();
    }

    return;
}

    mismatchTimer = setTimeout(() => {
        firstCard.element.classList.remove('card-open');
        secondCard.element.classList.remove('card-open');

        firstCard.element.querySelector('.card-front').style.opacity = '0';
        firstCard.element.querySelector('.card-back').style.opacity = '1';

        secondCard.element.querySelector('.card-front').style.opacity = '0';
        secondCard.element.querySelector('.card-back').style.opacity = '1';

        firstCard = null;
        secondCard = null;
        isLocked = false;
        mismatchTimer = null;
    }, 1000);
};


const finishGame = () => {
    if (gameFinished) {
        return;
    }

    gameFinished = true;

    const results = JSON.parse(
        localStorage.getItem(STORAGE_KEY),
    ) || [];

    results.push({
        moves,
        date: new Date().toISOString(),
    });

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(results),
    );

    victoryMoves.textContent = `Moves: ${moves}`;

    document.body.append(victoryModal);
};


const renderCards = () => {
    gameBoard.replaceChildren();

    cards.forEach((card) => {
        const cardElement = createCard(card);

        cardElement.addEventListener('click', () => {
            if (isLocked || card.matched) {
                return;
            }

            if (cardElement.classList.contains('card-open')) {
                return;
            }

            openCard(cardElement, card);
        });

        gameBoard.append(cardElement);
    });
};

// ===== VICTORY MODAL =====

const victoryModal = createElement('div', 'modal');
const victoryContent = createElement('div', 'modal-content');

const victoryTitle = createElement('h2', 'modal-title', 'You Win!');

const victoryMoves = createElement(
    'p',
    'modal-text',
    'Moves: 0',
);

const victoryNewGameButton = createElement(
    'button',
    'header-button',
    'New Game',
);

victoryNewGameButton.addEventListener('click', () => {
    startNewGame();
})

const victoryCloseButton = createElement(
    'button',
    'header-button',
    'Close',
);

victoryCloseButton.addEventListener('click', () => {
    victoryModal.remove();
});

victoryContent.append(
    victoryTitle,
    victoryMoves,
    victoryNewGameButton,
    victoryCloseButton,
);

victoryModal.append(victoryContent);


// ===== LEADERBOARD MODAL =====

const leaderboardModal = createElement('div', 'modal');
const leaderboardContent = createElement('div', 'modal-content');

const leaderboardTitle = createElement(
    'h2',
    'modal-title',
    'Leaderboard',
);

const leaderboardText = createElement('div', 'leaderboard-results');

const leaderboardCloseButton = createElement(
    'button',
    'header-button',
    'Close',
);

leaderboardCloseButton.addEventListener('click', () => {
    leaderboardModal.remove();
});

leaderboardContent.append(
    leaderboardTitle,
    leaderboardText,
    leaderboardCloseButton,
);

leaderboardModal.append(leaderboardContent);

leaderboardButton.addEventListener('click', () => {
    const results = JSON.parse(
        localStorage.getItem(STORAGE_KEY),
    ) || [];

    const sortedResults = [...results]
    .sort((a, b) => {
        if (a.moves !== b.moves) {
            return a.moves - b.moves;
        }

        return new Date(a.date) - new Date(b.date);
    })
    .slice(0, 10);

    leaderboardText.textContent = '';

    if (sortedResults.length === 0) {
        leaderboardText.textContent = 'No results yet';
    } else {
        sortedResults.forEach((result, index) => {
            const resultRow = createElement(
                'p',
                'modal-text',
                `${index + 1}. Moves: ${result.moves} — ${
                    new Date(result.date).toLocaleDateString()
                }`,
            );

            leaderboardText.append(resultRow);
        });
    }

    document.body.append(leaderboardModal);
});

// ===== PAGE =====

main.append(gameInfo, gameBoard);
document.body.append(header, main);



const startNewGame = () => {
    victoryModal.remove();

    if (mismatchTimer !== null) {
    clearTimeout(mismatchTimer);
    mismatchTimer = null;
}

    firstCard = null;
    secondCard = null;
    isLocked = false;

    moves = 0;
    pairs = 0;
    gameFinished = false;

    movesValue.textContent = '0';
    pairsValue.textContent = '0 / 8';

    cards = shuffleCards(createCards());

    renderCards();
};

// ===== START GAME =====

cards = shuffleCards(createCards());

renderCards();