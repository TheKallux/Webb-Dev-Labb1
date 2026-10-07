# Blackjack

Extra assignment in the Web Development course at Nackademin. The task was to make a card game in the browser where you play against the computer, and I chose Blackjack.

The game is built with plain HTML, CSS and JavaScript, without any framework, backend or database.

## Features

- Log in or register an account
- Users are saved in localStorage in JSON format (username, password and pot)
- Every player starts with 1000 kr in the pot
- You place a bet before every round, and the bet is taken from the pot
- A win gives back double the bet, a tie gives back the bet
- When the pot is 0 you can top it up again
- The cards are shown as images and change depending on which moves are made
- The dealer's second card is face down until the round is over
- It's clearly shown when the round is over, and you can play again right away with Deal

## Rules

- The goal is to get as close to 21 as possible without going over
- 2–10 are worth their number, J, Q and K are worth 10
- Ace is worth 11, or 1 if you would otherwise go over 21
- **Hit** = take another card
- **Stand** = stop, then it's the dealer's turn
- The dealer draws cards until it has at least 17
- If you go over 21 you lose right away

## Running the project

1. Clone the repo
2. Open the folder in VS Code
3. Right-click `index.html` and choose **Open with Live Server**

## File structure

```
├── index.html   – login, the game table and the buttons
├── style.css    – all the design
├── script.js    – game logic, login and pot
└── Images/      – the card images (1.png–52.png + card backs)
```

## How the code is built (short)

- `createDeck()` creates a deck of 52 cards. The images are numbered in the order A, K, Q, J, 10 … 2 and within each rank clubs, spades, hearts, diamonds, so the file number is calculated with `rank * 4 + suit + 1`
- `shuffleDeck()` shuffles the deck with Fisher–Yates
- `getHandValue()` adds up the points and turns aces from 11 into 1 when needed
- `startGame()` takes the bet and deals the cards
- `endGame()` shows the result and pays out the winnings
- `getUsers()` / `saveUsers()` read and save the users in localStorage with `JSON.parse` and `JSON.stringify`

## Things to keep in mind

The passwords are saved in plain text in localStorage. That works for a school assignment, but in a real app you would never do that, and instead have a backend that hashes the passwords.

## Things I would like to add

- Animation when the cards are dealt
- Split and double down
- A Blackjack (ace + 10-card right away) paying 3:2
- Log out button
