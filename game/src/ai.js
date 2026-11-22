// Ember Court opponent: the AI the player can read and counter. It always
// favours one suit (its "tell", shown glowing on the table with a musing
// line), plays its best card of that suit when it can, and otherwise plays
// its weakest card to save the strong ones.
import { SUIT_KEYS } from './config.js';

/** The AI's favoured suit this round: the suit it holds most of. */
export function favouredSuit(hand) {
  const counts = {};
  for (const suit of SUIT_KEYS) counts[suit] = 0;
  for (const card of hand) counts[card.suit] += 1;
  let best = SUIT_KEYS[0];
  for (const suit of SUIT_KEYS) if (counts[suit] > counts[best]) best = suit;
  return best;
}

const MUSINGS = {
  flame: 'The ember-keeper eyes the flames…',
  tide: 'The tide-caller listens to the water…',
  thorn: 'The thorn-witch strokes a leaf…',
  stone: 'The stone-warden weighs a pebble…',
};

/** The short line the table shows while the AI is thinking. */
export function musingFor(suit) {
  return MUSINGS[suit] || 'The court holds its breath…';
}

/**
 * Pick the AI's card: strongest card of its favoured suit when it holds one,
 * else its weakest card overall. Returns the card object from the hand.
 */
export function chooseCard(hand, courtSuit) {
  if (hand.length === 0) return null;
  const favoured = favouredSuit(hand);
  const inSuit = hand.filter((card) => card.suit === favoured);
  if (inSuit.length > 0) {
    let best = inSuit[0];
    for (const card of inSuit) if (card.value > best.value) best = card;
    return best;
  }
  let weakest = hand[0];
  for (const card of hand) if (card.value < weakest.value) weakest = card;
  return weakest;
}

/** The AI's readable tell: favoured suit, musing line, and its chosen card. */
export function aiTell(hand, courtSuit) {
  const favoured = favouredSuit(hand);
  return { favoured, musing: musingFor(favoured), card: chooseCard(hand, courtSuit) };
}
