document.addEventListener('DOMContentLoaded', () => {
    const startContainer = document.getElementById('start-container');
    const gameContainer = document.getElementById('game-container');
    const deckContainer = document.getElementById('deck-container');
    const dealerHand = document.querySelector('#dealer-hand .cards');
    const playerHandsContainer = document.getElementById('player-hands-container');
    const hitButton = document.getElementById('hit');
    const standButton = document.getElementById('stand');
    const doubleButton = document.getElementById('double');
    const splitButton = document.getElementById('split');
    const surrenderButton = document.getElementById('surrender');
    const startButton = document.getElementById('start-button');
    const numPlayersInput = document.getElementById('num-players');
    const messageArea = document.getElementById('message-area');
    const currentPlayerName = document.getElementById('current-player-name');

    let deck = [];
    let playerHands = [];
    let dealerCards = [];
    let currentPlayer = 0;

    const suits = ['S', 'H', 'D', 'C'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    function initializeDeck() {
        deck = [];
        for (const suit of suits) {
            for (const value of values) {
                deck.push(`${value}${suit}`);
            }
        }
        deck.sort(() => Math.random() - 0.5);
    }

    function dealInitialCards() {
        dealerCards = [deck.pop(), deck.pop()];
        playerHands.forEach(hand => {
            hand.cards = [deck.pop(), deck.pop()];
            hand.bust = false;
            hand.result = null;
        });
        renderHands();
    }

    function renderHands() {
        dealerHand.innerHTML = '';
        playerHandsContainer.innerHTML = '';

        // Render dealer's cards
        dealerCards.forEach((card, index) => {
            const cardImg = document.createElement('img');
            cardImg.src = `cards/${index === 1 && currentPlayer < playerHands.length ? 'back.png' : card}.png`; // Hide dealer's second card until all players are done
            cardImg.classList.add('card');
            dealerHand.appendChild(cardImg);
        });

        // Render player hands
        playerHands.forEach((hand, index) => {
            const handDiv = document.createElement('div');
            handDiv.classList.add('player-hand');
            handDiv.innerHTML = `<h2>${hand.name}</h2>`;
            const cardsDiv = document.createElement('div');
            cardsDiv.classList.add('cards');
            hand.cards.forEach((card) => {
                const cardImg = document.createElement('img');
                cardImg.src = `cards/${index === currentPlayer ? card : 'back'}.png`;
                cardImg.classList.add('card');
                cardsDiv.appendChild(cardImg);
            });
            handDiv.appendChild(cardsDiv);

            const resultDiv = document.createElement('div');
            resultDiv.classList.add('player-result');
            if (hand.result) {
                resultDiv.textContent = `Result: ${hand.result}`;
            }
            handDiv.appendChild(resultDiv);

            playerHandsContainer.appendChild(handDiv);
        });

        if (currentPlayer < playerHands.length) {
            currentPlayerName.textContent = playerHands[currentPlayer].name;
        } else {
            currentPlayerName.textContent = 'Dealer';
        }
    }

    function calculateHandValue(hand) {
        let value = hand.reduce((sum, card) => sum + cardValue(card), 0);
        let aces = hand.filter(card => card[0] === 'A').length;
        while (value > 21 && aces) {
            value -= 10;
            aces -= 1;
        }
        return value;
    }

    function cardValue(card) {
        const value = card.slice(0, -1);
        if (value === 'A') return 11;
        if (['J', 'Q', 'K'].includes(value)) return 10;
        return parseInt(value);
    }

    function showMessage(message) {
        messageArea.textContent = message;
    }

    function checkPlayerBust(hand) {
        return calculateHandValue(hand) > 21;
    }

    function nextPlayer() {
        currentPlayer++;
        if (currentPlayer >= playerHands.length) {
            dealerPlay();
        } else {
            renderHands();
            showMessage(`It's ${playerHands[currentPlayer].name}'s turn`);
        }
    }

    function dealerPlay() {
        renderHands(); // Reveal dealer's second card
        while (calculateHandValue(dealerCards) < 17) {
            dealerCards.push(deck.pop());
        }
        renderHands();
        determineResults();
    }

    function determineResults() {
        const dealerValue = calculateHandValue(dealerCards);
        dealerHand.innerHTML = '';
        dealerCards.forEach(card => {
            const cardImg = document.createElement('img');
            cardImg.src = `cards/${card}.png`;
            cardImg.classList.add('card');
            dealerHand.appendChild(cardImg);
        });

        playerHands.forEach(hand => {
            const playerValue = calculateHandValue(hand.cards);
            if (hand.bust) {
                hand.result = 'lose';
            } else if (dealerValue > 21) {
                hand.result = 'win';
            } else if (playerValue > dealerValue) {
                hand.result = 'win';
            } else if (playerValue < dealerValue) {
                hand.result = 'lose';
            } else {
                hand.result = 'push';
            }
        });

        showMessage('Game over. Check results.');
        renderFinalHands(); // Show all cards face-up
    }

    function renderFinalHands() {
        dealerHand.innerHTML = '';
        playerHandsContainer.innerHTML = '';

        // Render dealer's cards
        dealerCards.forEach((card) => {
            const cardImg = document.createElement('img');
            cardImg.src = `cards/${card}.png`; // Show all dealer's cards face-up
            cardImg.classList.add('card');
            dealerHand.appendChild(cardImg);
        });

        // Render player hands
        playerHands.forEach((hand) => {
            const handDiv = document.createElement('div');
            handDiv.classList.add('player-hand');
            handDiv.innerHTML = `<h2>${hand.name}</h2>`;
            const cardsDiv = document.createElement('div');
            cardsDiv.classList.add('cards');
            hand.cards.forEach((card) => {
                const cardImg = document.createElement('img');
                cardImg.src = `cards/${card}.png`; // Show all player's cards face-up
                cardImg.classList.add('card');
                cardsDiv.appendChild(cardImg);
            });
            handDiv.appendChild(cardsDiv);

            const resultDiv = document.createElement('div');
            resultDiv.classList.add('player-result');
            if (hand.result) {
                resultDiv.textContent = `Result: ${hand.result}`;
            }
            handDiv.appendChild(resultDiv);

            playerHandsContainer.appendChild(handDiv);
        });

        currentPlayerName.textContent = 'Dealer';
    }

    function shuffleAndDealCards() {
        const deck = document.getElementById('deck');
        deck.style.animation = 'shuffle 1s infinite';
        
        setTimeout(() => {
            deck.style.animation = '';
            initializeDeck();
            dealInitialCards();
        }, 3000); // Shuffle animation for 3 seconds
    }

    startButton.addEventListener('click', () => {
        const numPlayers = parseInt(numPlayersInput.value);
        if (numPlayers < 2 || numPlayers > 7) {
            showMessage('Please enter a number between 2 and 7.');
            return;
        }

        startContainer.style.display = 'none';
        gameContainer.style.display = 'flex'; // Ensure game container is flex
        gameContainer.classList.add('fade-in'); // Add fade-in effect

        playerHands = Array.from({ length: numPlayers }, (_, i) => ({ name: `Player ${i + 1}`, cards: [], bust: false, result: null }));
        shuffleAndDealCards();
    });

    hitButton.addEventListener('click', () => {
        const playerHand = playerHands[currentPlayer];
        playerHand.cards.push(deck.pop());
        renderHands();
        if (checkPlayerBust(playerHand)) {
            playerHand.bust = true;
            showMessage(`${playerHand.name} busts!`);
            nextPlayer();
        } else {
            showMessage(`It's ${playerHand.name}'s turn`);
        }
    });

    standButton.addEventListener('click', () => {
        nextPlayer();
    });

    doubleButton.addEventListener('click', () => {
        const playerHand = playerHands[currentPlayer];
        playerHand.cards.push(deck.pop());
        renderHands();
        if (checkPlayerBust(playerHand)) {
            playerHand.bust = true;
            showMessage(`${playerHand.name} busts!`);
        } else {
            showMessage(`It's ${playerHand.name}'s turn`);
        }
        nextPlayer();
    });

    splitButton.addEventListener('click', () => {
        const playerHand = playerHands[currentPlayer];
        if (playerHand.cards[0][0] === playerHand.cards[1][0]) {
            playerHand.cards = [[playerHand.cards[0]], [playerHand.cards[1]]];
            playerHand.cards.forEach(h => h.push(deck.pop()));
            renderHands();
        } else {
            showMessage('Cannot split these cards!');
        }
    });

    surrenderButton.addEventListener('click', () => {
        showMessage(`${playerHands[currentPlayer].name} surrenders. Half the bet is lost.`);
        nextPlayer();
    });
});
