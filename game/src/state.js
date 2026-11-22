// Ember Court state and rules: the whole game in one object — life totals,
// hands, the revealed Court Suit, rounds won, and the trick resolution that
// turns two played cards into damage, healing, draws and blocks.
import {
  SUITS, SUIT_KEYS, COURT_VALUE, START_LIFE, HAND_SIZE,
  FLAME_COURT_DAMAGE, TIDE_COURT_HEAL, THORN_COURT_DRAW,
} from './config.js';
import { buildDeck, shuffleDeck, drawCard, makeRandom } from './deck.js';
import { chooseCard, favouredSuit } from './ai.js';

/** A fresh game state, ready for the title screen. */
export function newGame(seed) {
  const random = makeRandom(seed === undefined ? (Math.random() * 0xffffffff) >>> 0 : seed);
  return {
    random,
    deck: [],
    playerHand: [],
    aiHand: [],
    playerLife: START_LIFE,
    aiLife: START_LIFE,
    playerRounds: 0,
    aiRounds: 0,
    round: 1,
    courtSuit: SUIT_KEYS[0],
    playerCard: null,
    aiCard: null,
    aiMusing: '',
    aiFavoured: 'flame',
    phase: 'choose',
    log: 'The court is dealt. Play a card to open the duel.',
    stoneBlock: { player: false, ai: false },
    over: false,
    winner: null,
  };
}

/** The value a card fights with: doubled when it matches the Court Suit. */
export function effectiveValue(card, courtSuit) {
  return card.suit === courtSuit ? card.value * 2 : card.value;
}

/** Deal a fresh deck and a starting hand of five to each side. */
export function dealGame(state) {
  state.deck = shuffleDeck(buildDeck(), state.random);
  state.playerHand = [];
  state.aiHand = [];
  for (let i = 0; i < HAND_SIZE; i += 1) {
    state.playerHand.push(drawCard(state.deck));
    state.aiHand.push(drawCard(state.deck));
  }
  state.courtSuit = SUIT_KEYS[Math.floor(state.random() * SUIT_KEYS.length)];
  const tell = favouredSuit(state.aiHand);
  state.aiFavoured = tell;
  state.aiMusing = 'The ember-keeper eyes the flames…';
  state.phase = 'choose';
  state.over = false;
  state.winner = null;
  return state;
}

/** Draw up to `count` cards into `hand`, skipping when the deck runs dry. */
export function refillHand(state, hand, count) {
  for (let i = 0; i < count; i += 1) {
    const card = drawCard(state.deck);
    if (card === null) break;
    hand.push(card);
  }
}

/**
 * Resolve one trick. Both cards are already chosen. The higher effective
 * value wins; the winner deals damage equal to the difference (Court powers
 * apply on top), the loser takes it, and both sides draw back to five.
 * Returns a log line describing what happened.
 */
export function resolveTrick(state) {
  const player = state.playerCard;
  const ai = state.aiCard;
  const playerValue = effectiveValue(player, state.courtSuit);
  const aiValue = effectiveValue(ai, state.courtSuit);
  let line = '';
  if (playerValue === aiValue) {
    line = 'A tie — ' + playerValue + ' against ' + aiValue + '. No damage.';
  } else {
    const playerWon = playerValue > aiValue;
    let damage = Math.abs(playerValue - aiValue);
    const winnerCard = playerWon ? player : ai;
    if (winnerCard.court && winnerCard.suit === 'flame') damage += FLAME_COURT_DAMAGE;
    const target = playerWon ? 'ai' : 'player';
    if (state.stoneBlock[target]) {
      state.stoneBlock[target] = false;
      line = (playerWon ? 'You win' : 'The keeper wins') + ' the trick ' + playerValue + '–' + aiValue +
        ', but the Stone Court blocks the ' + damage + ' damage!';
      damage = 0;
    } else if (damage > 0) {
      if (playerWon) state.aiLife = Math.max(0, state.aiLife - damage);
      else state.playerLife = Math.max(0, state.playerLife - damage);
      line = (playerWon ? 'You win' : 'The keeper wins') + ' the trick ' + playerValue + '–' + aiValue +
        ' and deal ' + damage + ' damage.';
    }
    if (playerWon) state.playerRounds += 1;
    else state.aiRounds += 1;
    if (winnerCard.court && winnerCard.suit === 'tide') {
      if (playerWon) state.playerLife = Math.min(START_LIFE, state.playerLife + TIDE_COURT_HEAL);
      else state.aiLife = Math.min(START_LIFE, state.aiLife + TIDE_COURT_HEAL);
      line += ' The Court of Tide heals ' + TIDE_COURT_HEAL + ' life.';
    }
    if (winnerCard.court && winnerCard.suit === 'thorn') {
      if (playerWon) refillHand(state, state.playerHand, THORN_COURT_DRAW);
      else refillHand(state, state.aiHand, THORN_COURT_DRAW);
      line += ' The Court of Thorn draws ' + THORN_COURT_DRAW + ' cards.';
    }
    if (winnerCard.court && winnerCard.suit === 'stone') {
      if (playerWon) state.stoneBlock.player = true;
      else state.stoneBlock.ai = true;
      line += ' The Court of Stone raises a ward.';
    }
  }
  state.log = line;
  state.playerCard = null;
  state.aiCard = null;
  refillHand(state, state.playerHand, HAND_SIZE - state.playerHand.length);
  refillHand(state, state.aiHand, HAND_SIZE - state.aiHand.length);
  if (state.playerLife <= 0 || state.aiLife <= 0) {
    state.over = true;
    state.winner = state.playerLife <= 0 ? 'ai' : 'player';
    state.phase = 'over';
  } else {
    state.round += 1;
    state.courtSuit = SUIT_KEYS[Math.floor(state.random() * SUIT_KEYS.length)];
    state.aiFavoured = favouredSuit(state.aiHand);
    state.phase = 'choose';
  }
  return line;
}

/**
 * Play one round: the player commits `card`, the AI answers with its readable
 * pick, and the trick resolves. Returns the log line.
 */
export function playRound(state, card) {
  if (state.phase !== 'choose' || state.over) return state.log;
  const index = state.playerHand.indexOf(card);
  if (index < 0) return state.log;
  state.playerHand.splice(index, 1);
  state.playerCard = card;
  const aiCard = chooseCard(state.aiHand, state.courtSuit);
  const aiIndex = state.aiHand.indexOf(aiCard);
  state.aiHand.splice(aiIndex, 1);
  state.aiCard = aiCard;
  state.phase = 'reveal';
  return resolveTrick(state);
}

/** Headless simulation: random player against the real AI, for the self-test. */
export function simulateGame(seed) {
  const state = newGame(seed);
  dealGame(state);
  let guard = 0;
  while (!state.over && guard < 500) {
    guard += 1;
    const hand = state.playerHand;
    if (hand.length === 0) break;
    const pick = hand[Math.floor(state.random() * hand.length)];
    playRound(state, pick);
  }
  return state.winner || 'draw';
}

/** Run `count` headless games; returns { player, ai, draws }. */
export function selfTest(count) {
  const result = { player: 0, ai: 0, draws: 0 };
  for (let i = 0; i < count; i += 1) {
    result[simulateGame(1000 + i)] += 1;
  }
  return result;
}

export { SUITS };
