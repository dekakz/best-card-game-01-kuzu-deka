// Ember Court screenshot states: ?shot=title|play|win|loss sets up each
// scene deterministically from a fixed seed, so the same URL always renders
// the same frame and every screenshot is a real render of the game's code.
import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_WIN, SCREEN_LOSS } from './config.js';
import { newGame, dealGame } from './state.js';
import { musingFor, favouredSuit } from './ai.js';

/** A mid-duel table: three rounds played, both sides bloodied, cards revealed. */
function stagePlay() {
  const state = newGame(20261123);
  dealGame(state);
  state.round = 4;
  state.playerRounds = 2;
  state.aiRounds = 1;
  state.playerLife = 16;
  state.aiLife = 13;
  state.courtSuit = 'flame';
  state.aiFavoured = favouredSuit(state.aiHand);
  state.aiMusing = musingFor(state.aiFavoured);
  const playerCard = state.playerHand[1];
  const aiCard = state.aiHand[0];
  state.playerHand.splice(1, 1);
  state.aiHand.splice(0, 1);
  state.playerCard = playerCard;
  state.aiCard = aiCard;
  state.phase = 'reveal';
  state.log = 'The keeper plays a ' + aiCard.value + ' of ' + aiCard.suit + ' — your ' + playerCard.value +
    ' of ' + playerCard.suit + ' answers. Court Suit Flame doubles the flame.';
  return { state, screen: SCREEN_PLAY };
}

/** The win screen: the keeper at 0 life, embers rising. */
function stageWin() {
  const state = newGame(20261124);
  dealGame(state);
  state.round = 9;
  state.playerRounds = 5;
  state.aiRounds = 3;
  state.playerLife = 12;
  state.aiLife = 0;
  state.over = true;
  state.winner = 'player';
  state.phase = 'over';
  state.log = 'The final trick falls. The court is yours.';
  return { state, screen: SCREEN_WIN };
}

/** The loss screen: the player at 0 life. */
function stageLoss() {
  const state = newGame(20261125);
  dealGame(state);
  state.round = 8;
  state.playerRounds = 3;
  state.aiRounds = 4;
  state.playerLife = 0;
  state.aiLife = 9;
  state.over = true;
  state.winner = 'ai';
  state.phase = 'over';
  state.log = 'The keeper takes the last trick. Your embers fade.';
  return { state, screen: SCREEN_LOSS };
}

/**
 * Set up the named shot and return { state, screen }.
 * Unknown names fall back to the title screen.
 */
export function stageShot(name) {
  if (name === 'play') return stagePlay();
  if (name === 'win') return stageWin();
  if (name === 'loss') return stageLoss();
  const state = newGame(20261122);
  dealGame(state);
  return { state, screen: SCREEN_TITLE };
}
