// gameController.js - Game flow and state management

import { getLevelConfig, LEVELS } from './levels.js';
import {
  showMenuPage,
  updateObjectiveCounters,
  updateMovesDisplay,
  updateScoreDisplay,
  updateLivesDisplay,
  updateTotalScoreDisplay,
  updateHighScoreDisplay,
  updateTimerDisplay
} from './ui.js';
import { getHighScore, getHighestLevel, loadGameProgress, clearGameProgress, saveGameProgress, canSave, saveTimerMode, isValidSaveExceptBoard, isValidBoardState } from './storage.js';
import {
  getSafeSymbol,
  hasPossibleMoves,
  generateGameBoard,
  updateCellClass
} from './board.js';
import { BOARD_SIZE, SYMBOLS, INITIAL_LIVES, TIMER_MODES } from './constants.js';
import { gameState, isObjectiveKey, setSelectedCell, resetGameState } from './gameState.js';
import { handleLevelLose } from './levelOutcomes.js';
import { setGameBoardRef, boardEventHandlers } from './boardEventHandlers.js';
import { startTimer, stopTimer } from './timer.js';
import { wireUpCellEvents } from './events.js';
import { showElement, hideElement, announce } from './utils.js';
import * as dom from './domElements.js';

/* -----------------------------------
   UI STATE
----------------------------------- */

export function showMenu() {
  document.body.classList.remove('game-playing');
  dom.container?.classList.remove('game-active');
  dom.heading?.classList.remove('sr-only');
  showMenuPage(
    dom.heading,
    dom.subtitle,
    dom.menu,
    dom.gameBoard,
    dom.movesDisplay,
    dom.scoreDisplay,
    dom.timerDisplay,
    dom.livesDisplay,
    dom.restartLevelModal
  );
  
  // Show high score and highest level on menu
  const highScore = getHighScore();
  const highestLevel = getHighestLevel();
  updateHighScoreDisplay(dom.highScoreDisplay, highScore);
  
  if (dom.highestLevelDisplay) {
    dom.highestLevelDisplay.textContent = `Highest Level: ${highestLevel}`;
    showElement(dom.highestLevelDisplay);
  }
  
  // Show/hide continue button, restart button, and play button based on saved progress
  const savedProgress = loadGameProgress();
  if (savedProgress) {
    // If there's saved progress, show Continue and Restart, hide Play
    if (dom.continueButton) {
      showElement(dom.continueButton);
    }
    if (dom.restartGameBtn) {
      showElement(dom.restartGameBtn);
    }
    if (dom.playButton) {
      hideElement(dom.playButton);
    }
  } else {
    // If no saved progress, show Play and hide Continue and Restart
    if (dom.continueButton) {
      hideElement(dom.continueButton);
    }
    if (dom.restartGameBtn) {
      hideElement(dom.restartGameBtn);
    }
    if (dom.playButton) {
      showElement(dom.playButton);
    }
  }
  
  // Warn if the browser is blocking storage
  if (dom.storageNotice) {
    if (canSave()) {
      hideElement(dom.storageNotice);
    } else {
      showElement(dom.storageNotice);
    }
  }

  // Hide home button on menu
  hideElement(dom.homeBtn);
}

export function showGameUI() {
  document.body.classList.add('game-playing');
  dom.container?.classList.add('game-active');
  dom.heading?.classList.add('sr-only');
  hideElement(dom.subtitle);
  hideElement(dom.menu);
  hideElement(dom.highScoreDisplay);
  hideElement(dom.highestLevelDisplay);

  // Always show both the container and the board
  dom.gameBoardContainer.classList.remove('hidden');
  dom.gameBoard.classList.remove('hidden');
  showElement(dom.scoreMovesWrapper);
  showElement(dom.levelDisplay);
  showElement(dom.movesDisplay);
  showElement(dom.scoreDisplay);
  if (gameState.timerMode === 'off') {
    hideElement(dom.timerDisplay);
  } else {
    showElement(dom.timerDisplay);
  }
  showElement(dom.livesDisplay);
  showElement(dom.objectiveCounters);
  showElement(dom.totalScoreDisplay);
  showElement(dom.homeBtn);

  hideElement(dom.restartLevelModal);
}

export function showGameOver() {
  showElement(dom.gameOverModal);
}

export function hideGameOver() {
  hideElement(dom.gameOverModal);
}

export function goHome() {
  // Auto-save progress before going home
  autoSaveProgress();

  gameState.timerActive = false;
  stopTimer(gameState);

  // Return to menu
  showMenu();
}

/* -----------------------------------
   CHANGES FROM ANOTHER TAB
----------------------------------- */

let timerWasActive = false;

// Called when another tab changes the saved game (the 'storage' event only
// fires in the other tabs, never in the tab that saved).
export function handleSavedGameChangedElsewhere() {
  const inLevel = dom.gameBoardContainer &&
    !dom.gameBoardContainer.classList.contains('hidden');

  if (!inLevel) {
    // Home screen: refresh Continue, Play, Best Score and Highest Level
    showMenu();
    return;
  }

  if (dom.otherTabModal && !dom.otherTabModal.classList.contains('hidden')) return;

  timerWasActive = gameState.timerActive;
  gameState.timerActive = false;
  stopTimer(gameState);
  showElement(dom.otherTabModal);
  dom.otherTabUseThisBtn?.focus();
  announce('This game was changed in another tab.');
}

export function useThisTab() {
  hideElement(dom.otherTabModal);
  autoSaveProgress();
  if (timerWasActive) {
    gameState.timerActive = true;
    if (gameState.timerMode !== 'off') startTimer(
      gameState,
      dom.timerDisplay,
      () => handleLevelLose(dom.restartLevelModal, dom.confirmRestartBtn, dom.confirmNextLevelBtn)
    );
  }
  timerWasActive = false;
}

export function leaveForOtherTab() {
  hideElement(dom.otherTabModal);
  timerWasActive = false;
  gameState.timerActive = false;
  stopTimer(gameState);
  // Keep the other tab's save: do not auto-save here
  showMenu();
}

/* -----------------------------------
   TIMER SETTING
----------------------------------- */

// Applies to the next level that starts (or is continued), not the one in play.
export function setTimerMode(mode) {
  if (!Object.prototype.hasOwnProperty.call(TIMER_MODES, mode)) return;
  gameState.timerMode = mode;
  saveTimerMode(mode);
}

/* -----------------------------------
   STATE HELPERS
----------------------------------- */

export function resetGame() {
  gameState.level = 1;
  gameState.lives = INITIAL_LIVES;
  gameState.score = 0;
  gameState.totalScore = 0;
}

function clearObjectives() {
  Object.keys(gameState).forEach((key) => {
    if (isObjectiveKey(key)) {
      delete gameState[key];
    }
  });
}

function getCurrentBoardState() {
  const board = [];
  // Cells aren't tagged with dataset.row/col during normal play (only
  // restoreBoardState() sets those, when rebuilding from a save) — read
  // position from DOM order instead, which board.js always keeps row-major.
  const cells = Array.from(dom.gameBoard.querySelectorAll('.cell'));

  for (let i = 0; i < BOARD_SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < BOARD_SIZE; j++) {
      const cell = cells[i * BOARD_SIZE + j];
      board[i][j] = cell ? cell.textContent : '';
    }
  }

  return board;
}

let saveFailureShown = false;
let saveFailureTimeout = null;

function reportSaveFailureOnce() {
  if (saveFailureShown) return;
  saveFailureShown = true;
  const message = "Couldn't save your progress. Your browser may be blocking storage.";
  announce(message);
  if (dom.saveFailedNotice) {
    showElement(dom.saveFailedNotice);
    clearTimeout(saveFailureTimeout);
    saveFailureTimeout = setTimeout(() => hideElement(dom.saveFailedNotice), 5000);
  }
}

export function autoSaveProgress() {
  // Only save if game is active and not at menu
  if (!gameState.levelComplete && gameState.level > 0) {
    const boardState = getCurrentBoardState();
    if (!saveGameProgress(gameState, boardState)) {
      reportSaveFailureOnce();
    }
  }
}

function loadObjectives(config) {
  clearObjectives();

  if (!config.objectives) return;

  config.objectives.forEach((objective) => {
    gameState[objective.label + 'Left'] = objective.count;
  });
}

/* -----------------------------------
   BOARD
----------------------------------- */

function generateBoard() {
  setGameBoardRef(dom.gameBoard);
  generateGameBoard(
    dom.gameBoard,
    BOARD_SIZE,
    SYMBOLS,
    getSafeSymbol,
    hasPossibleMoves,
    setupBoardEvents
  );
}

function setupBoardEvents() {
  wireUpCellEvents(
    dom.gameBoard,
    BOARD_SIZE,
    boardEventHandlers.onDragStart,
    boardEventHandlers.onDrop,
    boardEventHandlers.onTouchStart,
    boardEventHandlers.onTouchEnd,
    boardEventHandlers.onActivate
  );
}

/* -----------------------------------
   GAME FLOW
----------------------------------- */

export function startGame() {
  hideGameOver();

  resetGame();
  clearGameProgress(); // Clear any saved progress when starting new game
  showGameUI();

  updateLivesDisplay(dom.livesDisplay, gameState.lives);

  startLevel(1);
}

export function restartGameFromBeginning() {
  // Clear saved progress and start fresh
  clearGameProgress();
  startGame();
}

export function continueGame() {
  const savedProgress = loadGameProgress();
  
  if (!savedProgress) {
    // No saved progress, start new game
    startGame();
    return;
  }

  // A damaged or outdated save must never break the game
  if (!isValidSaveExceptBoard(savedProgress)) {
    startGame();
    announce("Your saved game couldn't be loaded, so a new game was started.");
    return;
  }

  // Only the board is bad: keep the progress and make a fresh board
  const boardState = isValidBoardState(savedProgress.boardState) ? savedProgress.boardState : null;

  // Restore game state
  gameState.level = savedProgress.level;
  gameState.lives = savedProgress.lives;
  gameState.score = savedProgress.score;
  gameState.totalScore = savedProgress.totalScore;
  gameState.movesLeft = savedProgress.movesLeft;
  gameState.timer = savedProgress.timer;
  gameState.levelComplete = false;
  gameState.timerActive = false;
  
  hideGameOver();
  showGameUI();
  
  const config = getLevelConfig(savedProgress.level);
  if (!config) {
    startGame();
    return;
  }
  
  // Load objectives structure from config first
  loadObjectives(config);
  
  // Then restore saved objective progress (overwrite with actual progress)
  if (savedProgress.objectives) {
    for (const key in savedProgress.objectives) {
      gameState[key] = savedProgress.objectives[key];
    }
  }
  
  // Restore board state
  restoreBoardState(boardState);
  
  // Update UI
  renderLevel(config);
  
  // Start timer if needed
  if (gameState.timerMode === 'off') {
    // No timer: the level is only lost by running out of moves
    gameState.timer = 0;
    gameState.timerActive = true;
    return;
  }
  if (config.timer && gameState.timer <= 0) {
    // Saved while the timer was off: give the level its full time
    gameState.timer = config.timer * TIMER_MODES[gameState.timerMode].factor;
  }
  updateTimerDisplay(dom.timerDisplay, gameState.timer);
  if (config.timer && gameState.timer > 0) {
    gameState.timerActive = true;
    startTimer(
      gameState,
      dom.timerDisplay,
      () => handleLevelLose(dom.restartLevelModal, dom.confirmRestartBtn, dom.confirmNextLevelBtn)
    );
  }
}

function restoreBoardState(boardState) {
  setSelectedCell(null);
  // Set game board reference
  setGameBoardRef(dom.gameBoard);
  
  if (!boardState || boardState.length === 0) {
    // No board state saved, generate new board
    generateBoard();
    return;
  }
  
  // Check if board has actual content
  const hasContent = boardState.some(row => row.some(cell => cell !== ''));
  
  if (!hasContent) {
    generateBoard();
    return;
  }
  
  // Clear existing board
  dom.gameBoard.innerHTML = '';
  
  // Recreate board from saved state
  boardState.forEach((row, i) => {
    row.forEach((symbol, j) => {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.textContent = symbol;
      updateCellClass(cell);
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.draggable = true;
      cell.tabIndex = 0;
      cell.setAttribute('role', 'button');
      cell.setAttribute('aria-label', `Game tile: ${symbol}, row ${i + 1}, column ${j + 1}`);
      dom.gameBoard.appendChild(cell);
    });
  });
  
  // Wire up events
  wireUpCellEvents(
    dom.gameBoard,
    BOARD_SIZE,
    boardEventHandlers.onDragStart,
    boardEventHandlers.onDrop,
    boardEventHandlers.onTouchStart,
    boardEventHandlers.onTouchEnd,
    boardEventHandlers.onActivate
  );
}

export function startLevel(levelNumber) {
  const config = getLevelConfig(levelNumber);

  if (!config) {
    showMenu();
    return;
  }

  setSelectedCell(null);
  gameState.level = levelNumber;
  resetGameState(config);

  renderLevel(config);
  generateBoard();

  if (gameState.timerMode === 'off') {
    // No timer: hide it and don't start it
    stopTimer(gameState);
    hideElement(dom.timerDisplay);
    return;
  }
  showElement(dom.timerDisplay);
  startTimer(
    gameState,
    dom.timerDisplay,
    () => handleLevelLose(dom.restartLevelModal, dom.confirmRestartBtn, dom.confirmNextLevelBtn)
  );
}

function renderLevel(config) {
  dom.levelDisplay.textContent = 'Level ' + gameState.level;

  updateTimerDisplay(dom.timerDisplay, gameState.timer);
  updateMovesDisplay(dom.movesDisplay, gameState.movesLeft);
  updateScoreDisplay(dom.scoreDisplay, gameState.score);
  updateLivesDisplay(dom.livesDisplay, gameState.lives);
  updateTotalScoreDisplay(dom.totalScoreDisplay, gameState.totalScore);

  updateObjectiveCounters(
    dom.objectiveCounters,
    config.objectives,
    gameState
  );
}

export function restartLevel() {
  hideGameOver();
  startLevel(gameState.level);
  hideElement(dom.restartLevelModal);
}

export function nextLevel() {
  // gameState.totalScore is already kept live in sync with each match's
  // score gain (see boardController.js's updateScoreAndObjectives), so it
  // already reflects the level just completed — adding gameState.score
  // again here would double-count it.

  // The final level never reaches this function: handleLevelWin() shows
  // the congratulations modal instead of the Level Complete modal, and it
  // owns the end-of-game logic (high score, clearing progress).
  if (gameState.level >= LEVELS.length) return;
  
  startLevel(gameState.level + 1);
  hideElement(dom.nextLevelModal);
}
