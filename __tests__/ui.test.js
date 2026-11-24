// ui.test.js - Unit tests for ui.js
// Add your tests here

import fs from 'fs';
import path from 'path';
import { updateObjectiveCounters, updateMovesDisplay, updateLivesDisplay, updateScoreDisplay, updateTimerDisplay, showMenuPage, updateHighScoreDisplay, updateTotalScoreDisplay } from '../src/ui.js';

describe('UI functions', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="score-moves-wrapper"></div>
      <div id="levelDisplay"></div>
    `;
  });

  test('updateObjectiveCounters handles null container gracefully', () => {
    expect(() => updateObjectiveCounters(null, [{ label: 'a', symbol: 'A', count: 1 }], { aLeft: 1 })).not.toThrow();
  });

  test('updateObjectiveCounters renders correct spans and values', () => {
    const container = document.createElement('div');
    const objectives = [
      { label: 'red', symbol: '🔴', count: 5 },
      { label: 'blue', symbol: '🔵', count: 3 }
    ];
    const state = { redLeft: 2, blueLeft: 1 };
    updateObjectiveCounters(container, objectives, state);
    expect(container.children.length).toBe(2);
    expect(container.children[0].textContent).toBe('🔴: 2');
    expect(container.children[1].textContent).toBe('🔵: 1');
  });

  test('updateObjectiveCounters marks an objective as done when it reaches zero', () => {
    const container = document.createElement('div');
    const objectives = [
      { label: 'violin', symbol: '🎻', count: 5 },
      { label: 'piano', symbol: '🎹', count: 3 }
    ];
    updateObjectiveCounters(container, objectives, { violinLeft: 0, pianoLeft: 2 });
    const [violin, piano] = container.children;
    expect(violin.classList.contains('done')).toBe(true);
    expect(violin.textContent).toBe('🎻: ✓');
    expect(violin.getAttribute('aria-label')).toBe('Violin: done');
    expect(piano.classList.contains('done')).toBe(false);
    expect(piano.textContent).toBe('🎹: 2');
    expect(piano.hasAttribute('aria-label')).toBe(false);
  });

  test('updateObjectiveCounters removes the done state when an objective is not finished', () => {
    const container = document.createElement('div');
    const objectives = [{ label: 'violin', symbol: '🎻', count: 5 }];
    updateObjectiveCounters(container, objectives, { violinLeft: 0 });
    expect(container.querySelector('.done')).not.toBeNull();
    // A new level (or a restart) renders the counters again with a full count
    updateObjectiveCounters(container, objectives, { violinLeft: 5 });
    expect(container.querySelector('.done')).toBeNull();
    expect(container.children[0].textContent).toBe('🎻: 5');
  });

  test('updateObjectiveCounters uses obj.count as fallback if state key missing', () => {
    const container = document.createElement('div');
    const objectives = [
      { label: 'red', symbol: '🔴', count: 5 },
      { label: 'blue', symbol: '🔵', count: 3 }
    ];
    const state = { redLeft: undefined };
    updateObjectiveCounters(container, objectives, state);
    expect(container.children[0].textContent).toBe('🔴: 5'); // fallback to count
    expect(container.children[1].textContent).toBe('🔵: 3'); // fallback to count
  });

  test('updateLivesDisplay updates the lives display text with the correct value', () => {
    const livesDisplay = document.createElement('div');
    updateLivesDisplay(livesDisplay, 3);
    expect(livesDisplay.textContent).toBe('❤️ Lives: 3');
  });

  test('updateLivesDisplay hides the heart from screen readers', () => {
    const livesDisplay = document.createElement('div');
    updateLivesDisplay(livesDisplay, 3);
    const heart = livesDisplay.querySelector('span[aria-hidden="true"]');
    expect(heart.textContent).toBe('❤️');
  });

  test('the lives counter in index.html starts with the markup updateLivesDisplay writes', () => {
    const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
    const page = document.createElement('div');
    page.innerHTML = html.match(/<div id="livesDisplay"[^>]*>[\s\S]*?<\/div>/)[0];
    const startingDisplay = page.firstElementChild;
    const updatedDisplay = document.createElement('div');
    updateLivesDisplay(updatedDisplay, 5);
    expect(startingDisplay.innerHTML).toBe(updatedDisplay.innerHTML);
  });
  
  test('updateMovesDisplay updates the moves display element correctly', () => {
    const movesDisplay = document.createElement('div');
    updateMovesDisplay(movesDisplay, 10);
    expect(movesDisplay.textContent).toBe('Moves: 10');
  });

  test('updateScoreDisplay updates the score display element correctly', () => {
    const scoreDisplay = document.createElement('div');
    updateScoreDisplay(scoreDisplay, 150);
    expect(scoreDisplay.textContent).toBe('Score: 150');
  });

  test('updateTimerDisplay updates the timer display element correctly', () => {
    const timerDisplay = document.createElement('div');
    updateTimerDisplay(timerDisplay, 30);
    expect(timerDisplay.textContent).toBe('Time: 0:30');
  });
  
  test('showMenuPage shows menu elements and hides game elements', () => {
    document.body.innerHTML = `
      <div id="game-board-container"></div>
      <div id="score-moves-wrapper"></div>
      <div id="levelDisplay"></div>
      <div id="totalScoreDisplay"></div>
    `;

    const heading = document.createElement('h1');
    const subtitle = document.createElement('h2');
    const menu = document.createElement('div');
    const gameBoard = document.createElement('div');
    const movesDisplay = document.createElement('div');
    const scoreDisplay = document.createElement('div');
    const timerDisplay = document.createElement('div');
    const livesDisplay = document.createElement('div');
    const restartContainer = document.createElement('div');

    [heading, subtitle, menu, gameBoard, movesDisplay, scoreDisplay, timerDisplay, livesDisplay, restartContainer].forEach(el => {
      el.classList.add('hidden');
    });

    showMenuPage(
      heading,
      subtitle,
      menu,
      gameBoard,
      movesDisplay,
      scoreDisplay,
      timerDisplay,
      livesDisplay,
      restartContainer
    );

    expect(heading.classList.contains('hidden')).toBe(false);
    expect(subtitle.classList.contains('hidden')).toBe(false);
    expect(menu.classList.contains('hidden')).toBe(false);
    expect(gameBoard.classList.contains('hidden')).toBe(true);
    expect(movesDisplay.classList.contains('hidden')).toBe(true);
    expect(scoreDisplay.classList.contains('hidden')).toBe(true);
    expect(timerDisplay.classList.contains('hidden')).toBe(true);
    expect(livesDisplay.classList.contains('hidden')).toBe(true);
    expect(restartContainer.classList.contains('hidden')).toBe(true);
    expect(document.getElementById('game-board-container').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('score-moves-wrapper').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('levelDisplay').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('totalScoreDisplay').classList.contains('hidden')).toBe(true);
  });

  test('timer warning class is toggled correctly based on timer value', () => {
    const timerDisplay = document.createElement('div');
    updateTimerDisplay(timerDisplay, 15);
    expect(timerDisplay.classList.contains('low-time')).toBe(false);
    updateTimerDisplay(timerDisplay, 10);
    expect(timerDisplay.classList.contains('low-time')).toBe(true);
    updateTimerDisplay(timerDisplay, 5);
    expect(timerDisplay.classList.contains('low-time')).toBe(true);
    updateTimerDisplay(timerDisplay, 0);
    expect(timerDisplay.classList.contains('low-time')).toBe(false); // No warning at 0
  });

  test('updateHighScoreDisplay updates the high score display text and shows it', () => {
    const highScoreDisplay = document.createElement('div');
    highScoreDisplay.classList.add('hidden');
    updateHighScoreDisplay(highScoreDisplay, 200);
    expect(highScoreDisplay.textContent).toBe('Best Score: 200');
    expect(highScoreDisplay.classList.contains('hidden')).toBe(false);
  });

  test('updateTotalScoreDisplay updates the total score display text correctly', () => {
    const totalScoreDisplay = document.createElement('div');
    updateTotalScoreDisplay(totalScoreDisplay, 500);
    expect(totalScoreDisplay.textContent).toBe('Total Score: 500');
  });

  test('score displays format large numbers with thousands separators', () => {
    const score = document.createElement('div');
    const total = document.createElement('div');
    const best = document.createElement('div');
    updateScoreDisplay(score, 1240);
    updateTotalScoreDisplay(total, 13580);
    updateHighScoreDisplay(best, 113580);
    expect(score.textContent).toBe('Score: 1,240');
    expect(total.textContent).toBe('Total Score: 13,580');
    expect(best.textContent).toBe('Best Score: 113,580');
  });
});
