// Ember Court input: mouse clicks on cards and buttons, plus keyboard —
// 1-5 play a card, Enter starts, M toggles sound. One listener per kind,
// delegated from the app root so re-renders never orphan a handler.
import { toggleMute, ensureAudio } from './audio.js';

/**
 * Wire input. `handlers` carries onPlayCard(cardId), onStart() and
 * onPlayAgain(). Returns nothing; the root listener lives for the session.
 */
export function bindInput(handlers) {
  const app = document.getElementById('app');
  app.addEventListener('click', (event) => {
    ensureAudio();
    const start = event.target.closest('#start-button');
    if (start) { handlers.onStart(); return; }
    const again = event.target.closest('#again-button');
    if (again) { handlers.onPlayAgain(); return; }
    const card = event.target.closest('[data-card]');
    if (card) handlers.onPlayCard(card.getAttribute('data-card'));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'm' || event.key === 'M') { toggleMute(); return; }
    if (event.key === 'Enter') {
      const start = document.getElementById('start-button');
      if (start) { handlers.onStart(); return; }
      const again = document.getElementById('again-button');
      if (again) { handlers.onPlayAgain(); return; }
    }
    const number = parseInt(event.key, 10);
    if (number >= 1 && number <= 5) handlers.onPlayNumber(number);
  });
}
