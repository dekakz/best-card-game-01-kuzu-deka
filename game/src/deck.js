// Ember Court deck: builds the 40-card deck, shuffles it with a seedable
// random source, and hands cards out one at a time.
import { SUIT_KEYS, MIN_VALUE, MAX_VALUE, COURT_VALUE } from './config.js';

/** A tiny deterministic random source; pass no seed for a Math.random deck. */
export function makeRandom(seed) {
  let state = (seed >>> 0) || 0x9e3779b9;
  return function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** One card: { suit, value, court } — court cards are value 10 with a power. */
export function makeCard(suit, value) {
  return { suit, value, court: value === COURT_VALUE, id: suit + '-' + value };
}

/** The full 40-card deck: values 1-9 plus one Court (10) per suit. */
export function buildDeck() {
  const deck = [];
  for (const suit of SUIT_KEYS) {
    for (let value = MIN_VALUE; value <= MAX_VALUE; value += 1) deck.push(makeCard(suit, value));
    deck.push(makeCard(suit, COURT_VALUE));
  }
  return deck;
}

/** Fisher-Yates shuffle in place, using the given random source. */
export function shuffleDeck(deck, random) {
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }
  return deck;
}

/** Draw the top card, or null when the deck is empty. */
export function drawCard(deck) {
  return deck.length === 0 ? null : deck.pop();
}
