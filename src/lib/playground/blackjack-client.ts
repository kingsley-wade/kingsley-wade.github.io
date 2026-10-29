import {
  createShuffledDeck,
  handValue,
  isNatural,
  resolveHand,
  type Card,
  type HandOutcome,
} from "./blackjack";

type Phase = "ready" | "player" | "dealer" | "finished";

const suitMarks: Record<Card["suit"], string> = {
  clubs: "♣",
  diamonds: "♦",
  hearts: "♥",
  spades: "♠",
};

const rankNames: Record<Card["rank"], string> = {
  A: "Ace",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  "10": "10",
  J: "Jack",
  Q: "Queen",
  K: "King",
};

const suitNames: Record<Card["suit"], string> = {
  clubs: "clubs",
  diamonds: "diamonds",
  hearts: "hearts",
  spades: "spades",
};

const createCardElement = (card: Card, hidden = false): HTMLLIElement => {
  const element = document.createElement("li");
  element.className = "blackjack__card";

  if (hidden) {
    element.classList.add("blackjack__card--back");
    element.setAttribute("aria-label", "Face-down dealer card");
    element.setAttribute("aria-hidden", "true");
    return element;
  }

  const isRed = card.suit === "diamonds" || card.suit === "hearts";
  if (isRed) element.classList.add("blackjack__card--red");
  element.setAttribute("aria-label", `${rankNames[card.rank]} of ${suitNames[card.suit]}`);

  const rank = document.createElement("span");
  rank.className = "blackjack__card-rank";
  rank.textContent = card.rank;

  const suit = document.createElement("span");
  suit.className = "blackjack__card-suit";
  suit.setAttribute("aria-hidden", "true");
  suit.textContent = suitMarks[card.suit];

  element.append(rank, suit);
  return element;
};

const formatValue = (cards: readonly Card[]): string => {
  const value = handValue(cards);
  return value.soft ? `${value.total} soft` : String(value.total);
};

export const initBlackjackArcade = (root: HTMLElement): void => {
  const dealerCardsElement = root.querySelector<HTMLUListElement>("[data-blackjack-dealer-cards]");
  const playerCardsElement = root.querySelector<HTMLUListElement>("[data-blackjack-player-cards]");
  const dealerTotalOutput = root.querySelector<HTMLOutputElement>("[data-blackjack-dealer-total]");
  const playerTotalOutput = root.querySelector<HTMLOutputElement>("[data-blackjack-player-total]");
  const status = root.querySelector<HTMLElement>("[data-blackjack-status]");
  const dealButton = root.querySelector<HTMLButtonElement>("[data-blackjack-deal]");
  const hitButton = root.querySelector<HTMLButtonElement>("[data-blackjack-hit]");
  const standButton = root.querySelector<HTMLButtonElement>("[data-blackjack-stand]");

  if (
    !dealerCardsElement ||
    !playerCardsElement ||
    !dealerTotalOutput ||
    !playerTotalOutput ||
    !status ||
    !dealButton ||
    !hitButton ||
    !standButton
  ) {
    return;
  }

  let deck: Card[] = [];
  let dealerCards: Card[] = [];
  let playerCards: Card[] = [];
  let dealerRevealed = false;
  let phase: Phase = "ready";
  let dealerTimer = 0;

  const updateControls = () => {
    hitButton.disabled = phase !== "player" || handValue(playerCards).total >= 21;
    standButton.disabled = phase !== "player";
    dealButton.textContent = phase === "ready" ? "Deal a hand" : "Deal another hand";
  };

  const updateView = () => {
    dealerCardsElement.replaceChildren(
      ...dealerCards.map((card, index) => createCardElement(card, index === 1 && !dealerRevealed)),
    );
    playerCardsElement.replaceChildren(...playerCards.map((card) => createCardElement(card)));
    playerTotalOutput.textContent = playerCards.length ? formatValue(playerCards) : "—";
    if (!dealerCards.length) {
      dealerTotalOutput.textContent = "—";
    } else if (dealerRevealed) {
      dealerTotalOutput.textContent = formatValue(dealerCards);
    } else {
      const upCard = dealerCards[0]!;
      dealerTotalOutput.textContent = `${rankNames[upCard.rank]} ${suitMarks[upCard.suit]} + ?`;
    }
    updateControls();
  };

  const endHand = (outcome: HandOutcome, message: string) => {
    window.clearTimeout(dealerTimer);
    dealerTimer = 0;
    dealerRevealed = true;
    phase = "finished";
    updateView();
    status.textContent = message;
    if (outcome === "player") root.dataset.lastOutcome = "win";
    else if (outcome === "dealer") root.dataset.lastOutcome = "loss";
    else root.dataset.lastOutcome = "push";
  };

  const announceOutcome = (outcome: HandOutcome, playerTotal: number, dealerTotal: number) => {
    if (playerTotal > 21) {
      endHand("dealer", `You bust at ${playerTotal}. Dealer takes this hand. Deal again?`);
      return;
    }
    if (outcome === "player") {
      endHand(outcome, dealerTotal > 21
        ? `Dealer busts at ${dealerTotal}. You win with ${playerTotal}!`
        : `You win ${playerTotal} to ${dealerTotal}. The dealer couldn't catch you.`);
      return;
    }
    if (outcome === "dealer") {
      endHand(outcome, `Dealer wins ${dealerTotal} to ${playerTotal}. Your turn to chase next hand.`);
      return;
    }
    endHand(outcome, `Push · both hands are ${playerTotal}. Deal again?`);
  };

  const finishAfterNatural = () => {
    const playerNatural = isNatural(playerCards);
    const dealerNatural = isNatural(dealerCards);
    if (!playerNatural && !dealerNatural) return false;

    const outcome: HandOutcome = playerNatural && dealerNatural
      ? "push"
      : playerNatural
        ? "player"
        : "dealer";
    const playerTotal = handValue(playerCards).total;
    const dealerTotal = handValue(dealerCards).total;
    const message = outcome === "push"
      ? "Natural 21 for both · push."
      : outcome === "player"
        ? "Natural 21 · the dealer can't catch that opening hand. You win!"
        : "The dealer opens with natural 21. This hand goes to the house.";
    endHand(outcome, message);
    return true;
  };

  const dealerStep = () => {
    if (phase !== "dealer") return;
    const playerTotal = handValue(playerCards).total;
    const dealerValue = handValue(dealerCards);

    if (dealerValue.bust || dealerValue.total >= playerTotal || deck.length === 0) {
      announceOutcome(resolveHand(playerTotal, dealerValue.total), playerTotal, dealerValue.total);
      return;
    }

    status.textContent = `Dealer: you're on ${playerTotal}; I'm at ${dealerValue.total}. One more card to catch up.`;
    dealerTimer = window.setTimeout(() => {
      const nextCard = deck.pop();
      if (!nextCard) {
        announceOutcome(resolveHand(playerTotal, handValue(dealerCards).total), playerTotal, handValue(dealerCards).total);
        return;
      }
      dealerCards.push(nextCard);
      updateView();
      dealerStep();
    }, 650);
  };

  const beginDealerChase = () => {
    phase = "dealer";
    dealerRevealed = true;
    updateView();
    status.textContent = `You're standing on ${handValue(playerCards).total}. Dealer, your move.`;
    dealerTimer = window.setTimeout(dealerStep, 650);
  };

  const dealHand = () => {
    window.clearTimeout(dealerTimer);
    dealerTimer = 0;
    deck = createShuffledDeck();
    playerCards = [];
    dealerCards = [];
    dealerRevealed = false;
    delete root.dataset.lastOutcome;

    for (let card = 0; card < 2; card += 1) {
      playerCards.push(deck.pop()!);
      dealerCards.push(deck.pop()!);
    }

    phase = "player";
    updateView();
    if (finishAfterNatural()) return;
    const upCard = dealerCards[0]!;
    status.textContent = `Dealer: "${rankNames[upCard.rank]} ${suitMarks[upCard.suit]} is showing. What's your move?"`;
  };

  const hit = () => {
    if (phase !== "player") return;
    const nextCard = deck.pop();
    if (!nextCard) return;
    playerCards.push(nextCard);
    const playerValue = handValue(playerCards);
    updateView();
    if (playerValue.bust) {
      dealerRevealed = true;
      announceOutcome("dealer", playerValue.total, handValue(dealerCards).total);
      return;
    }
    if (playerValue.total === 21) {
      status.textContent = "Twenty-one. Your turn ends here; let's see if the dealer can match it.";
      beginDealerChase();
      return;
    }
    status.textContent = `You draw ${rankNames[nextCard.rank]} ${suitMarks[nextCard.suit]} · total ${formatValue(playerCards)}. Hit or stand?`;
  };

  dealButton.addEventListener("click", dealHand);
  hitButton.addEventListener("click", hit);
  standButton.addEventListener("click", beginDealerChase);

  window.addEventListener("terminal:interaction", (event) => {
    const detail = (event as CustomEvent<{ action?: string }>).detail;
    if (detail?.action !== "arcade") return;
    root.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "center",
    });
    dealButton.focus({ preventScroll: true });
    dealHand();
  });
};
