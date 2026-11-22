// Ember Court: every rule number and label in one place, so the rest of the
// game reads the rules instead of inventing them.
export const SUITS = {
  flame: { key: 'flame', name: 'Flame', color: '#e5484d', dark: '#8f1d22', glow: '#ff6b5e', shape: 'triangle' },
  tide: { key: 'tide', name: 'Tide', color: '#3e9bff', dark: '#144a7d', glow: '#6ec1ff', shape: 'droplet' },
  thorn: { key: 'thorn', name: 'Thorn', color: '#46a758', dark: '#1d5c2e', glow: '#7ddc8f', shape: 'leaf' },
  stone: { key: 'stone', name: 'Stone', color: '#f5a524', dark: '#7a5200', glow: '#ffc95e', shape: 'diamond' },
};
export const SUIT_KEYS = ['flame', 'tide', 'thorn', 'stone'];
export const COURT_VALUE = 10;
export const MIN_VALUE = 1;
export const MAX_VALUE = 9;
export const START_LIFE = 20;
export const HAND_SIZE = 5;
export const FLAME_COURT_DAMAGE = 4;
export const TIDE_COURT_HEAL = 4;
export const THORN_COURT_DRAW = 2;
export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_WIN = 'win';
export const SCREEN_LOSS = 'loss';
export const COURT_POWERS = {
  flame: 'Court of Flame: +4 damage when it wins the trick.',
  tide: 'Court of Tide: heal 4 life when it wins the trick.',
  thorn: 'Court of Thorn: draw 2 cards when it wins the trick.',
  stone: 'Court of Stone: block the next damage dealt to you.',
};
