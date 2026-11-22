// Ember Court bootstrap: reads ?shot= for the screenshot scenes and
// ?selftest=1 for the headless 200-game balance check, otherwise runs the
// live duel — title screen, table, win and loss screens.
import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_WIN, SCREEN_LOSS } from './config.js';
import { newGame, dealGame, playRound, selfTest } from './state.js';
import { renderApp } from './render.js';
import { bindInput } from './input.js';
import { playSound, winSound, lossSound } from './audio.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);

/** Headless balance check: 200 games, random player vs the real AI. */
function runSelfTest() {
  const result = selfTest(200);
  const text = 'SELFTEST player=' + result.player + ' ai=' + result.ai + ' draws=' + result.draws;
  document.title = text;
  const app = document.getElementById('app');
  app.innerHTML = '<div class="screen"><h1 class="game-title">SELFTEST</h1><p class="tagline">' + text + '</p></div>';
}

function currentScreen(state) {
  if (state.over) return state.winner === 'player' ? SCREEN_WIN : SCREEN_LOSS;
  return SCREEN_PLAY;
}

function startDuel(state) {
  dealGame(state);
  renderApp(state, SCREEN_PLAY);
}

/** The live game: title, then a duel driven by clicks and keys 1-5. */
function runGame() {
  const state = newGame();
  renderApp(state, SCREEN_TITLE);
  bindInput({
    onStart: () => { startDuel(state); },
    onPlayAgain: () => { startDuel(state); },
    onPlayCard: (cardId) => {
      if (state.phase !== 'choose' || state.over) return;
      const card = state.playerHand.find((c) => c.id === cardId);
      if (!card) return;
      playSound();
      playRound(state, card);
      renderApp(state, currentScreen(state));
      if (state.over) { if (state.winner === 'player') winSound(); else lossSound(); }
    },
    onPlayNumber: (number) => {
      if (state.phase !== 'choose' || state.over) return;
      const card = state.playerHand[number - 1];
      if (!card) return;
      playSound();
      playRound(state, card);
      renderApp(state, currentScreen(state));
      if (state.over) { if (state.winner === 'player') winSound(); else lossSound(); }
    },
  });
}

if (params.get('selftest') === '1') {
  runSelfTest();
} else if (params.get('shot')) {
  const staged = stageShot(params.get('shot'));
  renderApp(staged.state, staged.screen);
} else {
  runGame();
}
