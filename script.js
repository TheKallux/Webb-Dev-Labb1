//----------------------------------------- Constants -----------------------------------------//

// Same order as the image files (1.png = A Clubs, 2.png = A Spades ...)
const ranks = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];
const suits = ["Clubs", "Spades", "Hearts", "Diamonds"];
const STARTING_POT = 1000;

//---------------------------------------- Game state -----------------------------------------//

let deck = [];
let playerHand = [];
let dealerHand = [];
let dealerHidden = true;
let currentUser = null;
let currentBet = 0;

//------------------------------------------- Deck --------------------------------------------//

// Creates a deck of 52 card objects
function createDeck() {
  const deck = [];

  for (let r = 0; r < ranks.length; r++) {
    for (let s = 0; s < suits.length; s++) {
      const fileNumber = r * 4 + s + 1;

      deck.push({
        rank: ranks[r],
        suit: suits[s],
        value: getCardValue(ranks[r]),
        image: `Images/${fileNumber}.png`,
      });
    }
  }
  return deck;
}

// Blackjack value of a rank
function getCardValue(rank) {
  if (rank === "A") {
    return 11;
  } else if (rank === "K" || rank === "Q" || rank === "J") {
    return 10;
  } else {
    return Number(rank);
  }
}

// Fisher-Yates shuffle
function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[randomIndex]] = [deck[randomIndex], deck[i]];
  }
  return deck;
}

//------------------------------------------- Hands -------------------------------------------//

// Total points of a hand (Ace = 11, or 1 if over 21)
function getHandValue(hand) {
  let total = 0;
  let aces = 0;

  for (const card of hand) {
    total += card.value;
    if (card.rank === "A") {
      aces++;
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

//----------------------------------------- Rendering -----------------------------------------//

// Shows a hand as images. The dealer's second card is face down while hidden.
function renderHand(hand, elementId) {
  const container = document.getElementById(elementId);
  container.innerHTML = "";

  for (let i = 0; i < hand.length; i++) {
    const card = hand[i];
    const img = document.createElement("img");

    if (elementId === "dealer-cards" && i === 1 && dealerHidden) {
      img.src = "Images/b1fv.png";
      img.alt = "Hidden card";
    } else {
      img.src = card.image;
      img.alt = `${card.rank} ${card.suit}`;
    }

    container.appendChild(img);
  }
}

// Updates cards and points on screen
function updateScreen() {
  renderHand(playerHand, "player-cards");
  renderHand(dealerHand, "dealer-cards");
  document.getElementById("player-score").textContent = getHandValue(playerHand);
  document.getElementById("dealer-score").textContent = dealerHidden
    ? "?"
    : getHandValue(dealerHand);
}

//-------------------------------------- Users & storage --------------------------------------//

// Reads all users from localStorage
function getUsers() {
  const data = localStorage.getItem("users");
  return data ? JSON.parse(data) : [];
}

// Saves all users to localStorage
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// The logged-in user's pot
function getPot() {
  const user = getUsers().find((u) => u.username === currentUser);
  return user.pot;
}

// Changes the pot and saves it
function setPot(amount) {
  const users = getUsers();
  const user = users.find((u) => u.username === currentUser);
  user.pot = amount;
  saveUsers(users);
  updatePot();
}

// Shows the pot, and the top-up button if it's 0
function updatePot() {
  const pot = getPot();
  document.getElementById("pot").textContent = pot;
  document.getElementById("popup-pot").textContent = pot;
  document.getElementById("refill-btn").hidden = pot > 0;
}

//----------------------------------------- Game flow -----------------------------------------//

// Switches from login to the game
function showGame() {
  document.getElementById("login-screen").hidden = true;
  document.getElementById("game-screen").hidden = false;
  document.getElementById("current-user").textContent = currentUser;
  document.getElementById("controls").hidden = true;
  updatePot();
}

// Starts a new round (runs when you click Deal)
function startGame() {
  const bet = Number(document.getElementById("bet").value);
  const pot = getPot();

  if (bet <= 0 || bet > pot) {
    document.getElementById("bet-message").textContent = "Invalid bet.";
    return;
  }

  document.getElementById("bet-message").textContent = "";
  currentBet = bet;
  setPot(pot - bet);

  deck = shuffleDeck(createDeck());
  playerHand = [];
  dealerHand = [];
  dealerHidden = true;

  playerHand.push(deck.pop());
  dealerHand.push(deck.pop());
  playerHand.push(deck.pop());
  dealerHand.push(deck.pop());

  document.getElementById("message").textContent = "";
  document.getElementById("bet-area").hidden = true;
  document.getElementById("controls").hidden = false;

  updateScreen();
}

// Ends the round: shows the result and pays out
function endGame() {
  dealerHidden = false;
  updateScreen();

  const player = getHandValue(playerHand);
  const dealer = getHandValue(dealerHand);
  let result;

  if (player > 21) {
    result = "You went bust! Dealer wins.";
  } else if (dealer > 21) {
    result = "Dealer went bust! You win!";
    setPot(getPot() + currentBet * 2);
  } else if (player > dealer) {
    result = "You win!";
    setPot(getPot() + currentBet * 2);
  } else if (dealer > player) {
    result = "Dealer wins.";
  } else {
    result = "It's a tie.";
    setPot(getPot() + currentBet);
  }

  document.getElementById("message").textContent = result;
  document.getElementById("controls").hidden = true;
  document.getElementById("bet-area").hidden = false;
}

//-------------------------------------------- Events ------------------------------------------//

// Register
document.getElementById("register-btn").addEventListener("click", function () {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const message = document.getElementById("login-message");
  const users = getUsers();

  if (username === "" || password === "") {
    message.textContent = "Fill in both fields.";
  } else if (users.find((u) => u.username === username)) {
    message.textContent = "That username is already taken.";
  } else {
    users.push({ username: username, password: password, pot: STARTING_POT });
    saveUsers(users);
    message.textContent = "Account created! Now log in.";
  }
});

// Log in
document.getElementById("login-btn").addEventListener("click", function () {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const user = getUsers().find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    currentUser = user.username;
    showGame();
  } else {
    document.getElementById("login-message").textContent =
      "Wrong username or password.";
  }
});

// Deal = start a round
document.getElementById("deal-btn").addEventListener("click", startGame);

// Hit = draw a card, and lose straight away if over 21
document.getElementById("hit-btn").addEventListener("click", function () {
  playerHand.push(deck.pop());
  updateScreen();

  if (getHandValue(playerHand) > 21) {
    endGame();
  }
});

// Stand = the dealer draws until at least 17
document.getElementById("stand-btn").addEventListener("click", function () {
  while (getHandValue(dealerHand) < 17) {
    dealerHand.push(deck.pop());
  }
  endGame();
});

// Top up the pot
document.getElementById("refill-btn").addEventListener("click", function () {
  setPot(STARTING_POT);
  document.getElementById("bet-message").textContent =
    "The pot has been topped up with 1000 kr!";
});