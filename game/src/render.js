// Ember Court rendering: every pixel on the table is a DOM element — cards
// with big numerals and a suit shape drawn as SVG (colour AND shape, never
// text alone), life bars, the Court Suit banner, the AI's tell, and the win
// flourish of rising embers.
import { SUITS, COURT_POWERS, SCREEN_TITLE, SCREEN_PLAY, SCREEN_WIN, SCREEN_LOSS } from './config.js';
import { effectiveValue } from './state.js';

export { SCREEN_TITLE, SCREEN_PLAY, SCREEN_WIN, SCREEN_LOSS };

/** Inline SVG for each suit shape, drawn in the suit's own colour. */
export function suitShape(suitKey, size) {
  const color = SUITS[suitKey].color;
  const s = size || 28;
  if (suitKey === 'flame') return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24"><path d="M12 2 L21 20 L3 20 Z" fill="' + color + '"/></svg>';
  if (suitKey === 'tide') return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24"><path d="M12 2 C12 2 5 11 5 15 A7 7 0 0 0 19 15 C19 11 12 2 12 2 Z" fill="' + color + '"/></svg>';
  if (suitKey === 'thorn') return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24"><path d="M12 2 C5 7 3 14 12 22 C21 14 19 7 12 2 Z" fill="' + color + '"/><path d="M12 6 L12 20" stroke="#0d2b14" stroke-width="1.4"/></svg>';
  return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24"><path d="M12 2 L21 12 L12 22 L3 12 Z" fill="' + color + '"/></svg>';
}

/** One card face: big value, suit shape, suit name, Court crown when court. */
export function cardFaceHTML(card, courtSuit) {
  const suit = SUITS[card.suit];
  const doubled = card.suit === courtSuit;
  return '<div class="card-face suit-' + card.suit + (doubled ? ' court-doubled' : '') + '">' +
    '<div class="card-corner"><span class="card-num">' + card.value + '</span>' + suitShape(card.suit, 20) + '</div>' +
    '<div class="card-centre">' + suitShape(card.suit, card.court ? 34 : 44) +
    '<div class="card-big">' + card.value + '</div>' +
    (card.court ? '<div class="card-court">COURT</div>' : '') + '</div>' +
    '<div class="card-suit-name">' + suit.name + (doubled ? ' ×2' : '') + '</div></div>';
}

/** A face-down card back: the ember sigil. */
export function cardBackHTML() {
  return '<div class="card-back"><div class="card-back-sigil">◆</div><div class="card-back-word">EMBER<br>COURT</div></div>';
}

function lifeBarHTML(life, max) {
  const pct = Math.max(0, Math.round((life / max) * 100));
  return '<div class="life-bar"><div class="life-fill" style="width:' + pct + '%"></div><span class="life-num">' + life + ' ❤</span></div>';
}

/** The table for a live game: hands, life, round, score and the Court banner. */
export function tableHTML(state) {
  const court = SUITS[state.courtSuit];
  const playerCards = state.playerHand.map((card, i) =>
    '<button class="card deal-in" style="animation-delay:' + (i * 70) + 'ms" data-card="' + card.id + '" aria-label="' + court.name + ' ' + card.value + '">' +
    cardFaceHTML(card, state.courtSuit) + '</button>').join('');
  const aiCards = state.aiHand.map((card) =>
    '<div class="card ai-card' + (card.suit === state.aiFavoured ? ' ai-favoured' : '') + '">' + cardBackHTML() + '</div>').join('');
  const played = (state.playerCard || state.aiCard)
    ? '<div class="played-row">' +
      (state.aiCard ? '<div class="card played flip-in">' + cardFaceHTML(state.aiCard, state.courtSuit) + '</div>' : '<div class="card played empty"></div>') +
      '<div class="versus">VS</div>' +
      (state.playerCard ? '<div class="card played flip-in">' + cardFaceHTML(state.playerCard, state.courtSuit) + '</div>' : '<div class="card played empty"></div>') +
      '</div>'
    : '<div class="played-row"><div class="played-hint">Play a card from your hand — click it, or press 1–5.</div></div>';
  return '<div class="table">' +
    '<div class="opponent-row"><div class="side-label">EMBER-KEEPER <span class="ai-tell">' + state.aiMusing + '</span></div>' +
    '<div class="hand ai-hand">' + aiCards + '</div>' + lifeBarHTML(state.aiLife, 20) + '</div>' +
    '<div class="centre-row"><div class="court-banner" style="border-color:' + court.color + '">' +
    suitShape(state.courtSuit, 30) + '<span>Court Suit: ' + court.name + ' — values doubled</span></div>' +
    '<div class="score-line">Round ' + state.round + ' &nbsp;•&nbsp; Tricks won — You ' + state.playerRounds + ' : ' + state.aiRounds + ' Keeper &nbsp;•&nbsp; Deck ' + state.deck.length + '</div>' +
    played +
    '<div class="game-log">' + state.log + '</div>' +
    (state.stoneBlock.player ? '<div class="ward-note">Your Stone ward stands — the next damage is blocked.</div>' : '') +
    '</div>' +
    '<div class="player-row"><div class="side-label">YOU</div>' +
    '<div class="hand player-hand">' + playerCards + '</div>' + lifeBarHTML(state.playerLife, 20) + '</div>' +
    '</div>';
}

/** Title screen: the name, the four suits, the rules in one breath, start. */
export function titleHTML() {
  const suits = Object.keys(SUITS).map((key) =>
    '<div class="suit-chip" style="border-color:' + SUITS[key].color + '">' + suitShape(key, 34) +
    '<span style="color:' + SUITS[key].color + '">' + SUITS[key].name + '</span></div>').join('');
  return '<div class="screen title-screen"><div class="title-embers"></div>' +
    '<h1 class="game-title">EMBER<br>COURT</h1>' +
    '<p class="tagline">A duel of four suits. One card a round. Twenty life. No mercy.</p>' +
    '<div class="suit-row">' + suits + '</div>' +
    '<div class="rules-box"><p>Each round a <b>Court Suit</b> is revealed — its cards fight at <b>double value</b>.</p>' +
    '<p>Both sides play one card face down, then reveal. Higher value wins the trick and deals damage equal to the difference.</p>' +
    '<p>Court cards (10) carry powers: Flame +4 damage, Tide heal 4, Thorn draw 2, Stone block the next hit.</p>' +
    '<p>Watch the keeper’s favoured suit glow — that is the tell. Counter it.</p></div>' +
    '<button class="start-button" id="start-button">ENTER THE COURT</button>' +
    '<p class="hint-line">Click a card or press 1–5 to play • M toggles sound</p></div>';
}

/** End screen, win or loss, with the final score and the flourish. */
export function endHTML(state, won) {
  const title = won ? 'THE COURT IS YOURS' : 'THE KEEPER PREVAILS';
  const sub = won
    ? 'The ember-keeper bows. Twenty life stood against the flame — and yours held.'
    : 'Your embers fade. The keeper keeps the court — for now.';
  return '<div class="screen end-screen ' + (won ? 'win' : 'loss') + '">' +
    (won ? '<div class="ember-burst"></div>' : '') +
    '<h1 class="end-title">' + title + '</h1>' +
    '<p class="end-sub">' + sub + '</p>' +
    '<div class="final-score">Final score — You ' + state.playerRounds + ' tricks, ' + state.playerLife + ' life &nbsp;•&nbsp; Keeper ' + state.aiRounds + ' tricks, ' + state.aiLife + ' life</div>' +
    '<button class="start-button" id="again-button">PLAY AGAIN</button></div>';
}

/** Mount the right screen for the state into #app. */
export function renderApp(state, screen) {
  const app = document.getElementById('app');
  if (screen === SCREEN_TITLE) app.innerHTML = titleHTML();
  else if (screen === SCREEN_WIN) app.innerHTML = endHTML(state, true);
  else if (screen === SCREEN_LOSS) app.innerHTML = endHTML(state, false);
  else app.innerHTML = tableHTML(state);
  if (screen === SCREEN_WIN) spawnEmbers(app);
}

/** Rising ember particles for the win flourish. */
export function spawnEmbers(app) {
  const burst = app.querySelector('.ember-burst');
  if (!burst) return;
  for (let i = 0; i < 42; i += 1) {
    const ember = document.createElement('span');
    ember.className = 'ember';
    ember.style.left = (8 + Math.random() * 84) + '%';
    ember.style.animationDelay = (Math.random() * 1.6) + 's';
    ember.style.background = ['#ff6b5e', '#f5a524', '#ffd166'][i % 3];
    burst.appendChild(ember);
  }
}

export { COURT_POWERS };
