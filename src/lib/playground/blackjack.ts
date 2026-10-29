const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;
const suits = ["clubs", "diamonds", "hearts", "spades"] as const;

export type CardRank = (typeof ranks)[number];
export type CardSuit = (typeof suits)[number];
export type Card = { rank: CardRank; suit: CardSuit };
export type HandValue = { total: number; soft: boolean; bust: boolean };
export type HandOutcome = "player" | "dealer" | "push";

export const createShuffledDeck = (random: () => number = Math.random): Card[] => {
  const deck = suits.flatMap((suit) => ranks.map((rank) => ({ rank, suit })));
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = deck[index]!;
    deck[index] = deck[swapIndex]!;
    deck[swapIndex] = current;
  }
  return deck;
};

export const handValue = (cards: readonly Card[]): HandValue => {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === "A") {
      total += 11;
      aces += 1;
    } else if (card.rank === "J" || card.rank === "Q" || card.rank === "K") {
      total += 10;
    } else {
      total += Number(card.rank);
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return { total, soft: aces > 0, bust: total > 21 };
};

export const isNatural = (cards: readonly Card[]): boolean =>
  cards.length === 2 && handValue(cards).total === 21;

export const resolveHand = (playerTotal: number, dealerTotal: number): HandOutcome => {
  if (playerTotal > 21) return "dealer";
  if (dealerTotal > 21) return "player";
  if (playerTotal === dealerTotal) return "push";
  return playerTotal > dealerTotal ? "player" : "dealer";
};
