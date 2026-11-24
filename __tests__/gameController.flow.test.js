// gameController.flow.test.js - Covers the game-flow/state-transition logic
// in gameController.js (startGame, continueGame, startLevel, restartLevel,
// nextLevel, autoSaveProgress) that gameController.test.js does not exercise.
// Dependency modules are mocked so gameController's own branching is what's
// under test, while dom.* elements are real jsdom nodes so classList/
// textContent assertions reflect actual behavior.

// Defined inline (not hoisted out) so the mock factory is self-contained -
// referencing an outer "mock"-prefixed const here resolves to undefined
// under Jest's module hoisting, even though jest.fn() closures over it work.
jest.mock('../src/levels.js', () => {
  const LEVELS = [
    { moves: 10, timer: 30, objectives: [{ symbol: 'A', label: 'alpha', count: 2 }] },
    { moves: 12, timer: 40, objectives: [{ symbol: 'B', label: 'beta', count: 3 }] },
  ];
  return {
    LEVELS,
    getLevelConfig: jest.fn((n) => LEVELS[n - 1]),
  };
});

jest.mock('../src/storage.js', () => ({
  getHighScore: jest.fn(() => 0),
  saveHighScore: jest.fn(),
  getHighestLevel: jest.fn(() => 0),
  saveHighestLevel: jest.fn(),
  loadGameProgress: jest.fn(() => null),
  clearGameProgress: jest.fn(),
  saveGameProgress: jest.fn(),
  canSave: jest.fn(() => true),
  // Real validators, so continueGame's handling of bad saves is tested for real.
  isValidSaveExceptBoard: jest.requireActual('../src/storage.js').isValidSaveExceptBoard,
  isValidBoardState: jest.requireActual('../src/storage.js').isValidBoardState,
}));

jest.mock('../src/board.js', () => ({
  getSafeSymbol: jest.fn(),
  hasPossibleMoves: jest.fn(() => true),
  generateGameBoard: jest.fn(),
  updateCellClass: jest.fn(),
}));

jest.mock('../src/timer.js', () => ({
  startTimer: jest.fn(),
  stopTimer: jest.fn(),
}));

jest.mock('../src/events.js', () => ({
  wireUpCellEvents: jest.fn(),
}));

jest.mock('../src/boardEventHandlers.js', () => ({
  setGameBoardRef: jest.fn(),
  boardEventHandlers: {
    onDragStart: jest.fn(),
    onDrop: jest.fn(),
    onTouchStart: jest.fn(),
    onTouchEnd: jest.fn(),
    onActivate: jest.fn(),
  },
}));

jest.mock('../src/ui.js', () => ({
  // Real implementation so timer-display assertions reflect actual DOM behavior.
  updateTimerDisplay: (timerDisplay, timer) => {
    if (!timerDisplay) return;
    timerDisplay.textContent = `Time: ${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}`;
    if (timerDisplay.classList) {
      timerDisplay.classList.toggle('low-time', timer <= 10 && timer > 0);
    }
  },
  showMenuPage: jest.fn(),
  updateLivesDisplay: jest.fn(),
  updateMovesDisplay: jest.fn(),
  updateScoreDisplay: jest.fn(),
  updateTotalScoreDisplay: jest.fn(),
  updateHighScoreDisplay: jest.fn(),
  updateObjectiveCounters: jest.fn(),
}));

jest.mock('../src/levelOutcomes.js', () => ({
  handleLevelWin: jest.fn(),
  handleLevelLose: jest.fn(),
}));

import * as storageMock from '../src/storage.js';
import * as utils from '../src/utils.js';
import * as boardMock from '../src/board.js';
import * as timerMock from '../src/timer.js';
import * as levelOutcomesMock from '../src/levelOutcomes.js';
import { LEVELS as mockLevels } from '../src/levels.js';
import { gameState } from '../src/gameState.js';
import { INITIAL_LIVES, BOARD_SIZE, SYMBOLS } from '../src/constants.js';
import * as dom from '../src/domElements.js';
import {
  resetGame,
  startGame,
  restartGameFromBeginning,
  continueGame,
  startLevel,
  restartLevel,
  nextLevel,
  autoSaveProgress,
  handleSavedGameChangedElsewhere,
  useThisTab,
  leaveForOtherTab,
} from '../src/gameController.js';

function validBoard(symbol = SYMBOLS[0]) {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(symbol));
}

function el(startHidden = false) {
  const e = document.createElement('div');
  if (startHidden) e.classList.add('hidden');
  return e;
}

describe('gameController flow', () => {
  beforeEach(() => {
    // Fresh real DOM nodes each test, mirroring index.html's initial classes.
    dom.container = el();
    dom.heading = el();
    dom.subtitle = el();
    dom.menu = el();
    dom.gameBoard = el();
    dom.gameBoardContainer = el(true);
    dom.scoreMovesWrapper = el();
    dom.levelDisplay = el(true);
    dom.movesDisplay = el(true);
    dom.scoreDisplay = el(true);
    dom.timerDisplay = el(true);
    dom.livesDisplay = el();
    dom.totalScoreDisplay = el(true);
    dom.objectiveCounters = el();
    dom.highScoreDisplay = el(true);
    dom.highestLevelDisplay = el(true);
    dom.continueButton = el(true);
    dom.restartGameBtn = el(true);
    dom.playButton = el();
    dom.homeBtn = el(true);
    dom.restartLevelModal = el(true);
    dom.confirmRestartBtn = el();
    dom.nextLevelModal = el(true);
    dom.confirmNextLevelBtn = el();
    dom.gameOverModal = el(true);
    dom.congratsModal = el(true);
    dom.congratsFinalScore = el();
    dom.otherTabModal = el(true);
    dom.otherTabUseThisBtn = el();
    dom.otherTabGoHomeBtn = el();

    // Reset the shared gameState singleton to a known baseline.
    Object.assign(gameState, {
      movesLeft: 0,
      score: 0,
      totalScore: 0,
      isResolving: false,
      level: 1,
      levelComplete: false,
      timer: 0,
      timerInterval: null,
      timerActive: false,
      timerMode: 'normal',
      lives: INITIAL_LIVES,
      draggedCell: null,
      touchStartCell: null,
      touchStartX: null,
      touchStartY: null,
      selectedCell: null,
      alphaLeft: undefined,
      betaLeft: undefined,
    });
    delete gameState.alphaLeft;
    delete gameState.betaLeft;

    jest.clearAllMocks();
    storageMock.loadGameProgress.mockReturnValue(null);
    storageMock.canSave.mockReturnValue(true);
    storageMock.saveGameProgress.mockReturnValue(true);
  });

  test('resetGame resets level, lives, score, and totalScore', () => {
    gameState.level = 5;
    gameState.lives = 1;
    gameState.score = 999;
    gameState.totalScore = 500;
    resetGame();
    expect(gameState.level).toBe(1);
    expect(gameState.lives).toBe(INITIAL_LIVES);
    expect(gameState.score).toBe(0);
    expect(gameState.totalScore).toBe(0);
  });

  test('startLevel configures gameState and renders the level', () => {
    startLevel(1);
    expect(gameState.level).toBe(1);
    expect(gameState.levelComplete).toBe(false);
    expect(gameState.movesLeft).toBe(mockLevels[0].moves);
    expect(gameState.timer).toBe(mockLevels[0].timer);
    expect(gameState.timerActive).toBe(true);
    expect(gameState.score).toBe(0);
    expect(gameState.alphaLeft).toBe(2);
    expect(dom.levelDisplay.textContent).toBe('Level 1');
    expect(boardMock.generateGameBoard).toHaveBeenCalled();
    expect(timerMock.startTimer).toHaveBeenCalled();
  });

  test('startLevel with Extra time doubles the level timer', () => {
    gameState.timerMode = 'extra';
    startLevel(1);
    expect(gameState.timer).toBe(mockLevels[0].timer * 2);
    expect(timerMock.startTimer).toHaveBeenCalled();
    expect(dom.timerDisplay.classList.contains('hidden')).toBe(false);
  });

  test('startLevel with No timer hides the timer and never starts it', () => {
    gameState.timerMode = 'off';
    startLevel(1);
    expect(gameState.timer).toBe(0);
    expect(gameState.timerActive).toBe(true); // the player can still move
    expect(timerMock.startTimer).not.toHaveBeenCalled();
    expect(dom.timerDisplay.classList.contains('hidden')).toBe(true);
    expect(levelOutcomesMock.handleLevelLose).not.toHaveBeenCalled();
  });

  test('continueGame with No timer does not start the timer', () => {
    gameState.timerMode = 'off';
    storageMock.loadGameProgress.mockReturnValueOnce({
      level: 1, lives: 3, score: 0, totalScore: 0, movesLeft: 8, timer: 20,
      objectives: { alphaLeft: 2 }, boardState: [],
    });
    continueGame();
    expect(timerMock.startTimer).not.toHaveBeenCalled();
    expect(gameState.timerActive).toBe(true);
    expect(dom.timerDisplay.classList.contains('hidden')).toBe(true);
  });

  test('continueGame gives a level saved with no timer its full time once the timer is back on', () => {
    gameState.timerMode = 'normal';
    storageMock.loadGameProgress.mockReturnValueOnce({
      level: 1, lives: 3, score: 0, totalScore: 0, movesLeft: 8, timer: 0,
      objectives: { alphaLeft: 2 }, boardState: [],
    });
    continueGame();
    expect(gameState.timer).toBe(mockLevels[0].timer);
    expect(timerMock.startTimer).toHaveBeenCalled();
  });

  test('startLevel falls back to the menu when the level config is missing', () => {
    dom.container.classList.add('game-active');
    startLevel(999);
    expect(dom.container.classList.contains('game-active')).toBe(false);
    // No saved progress -> Play shown, Continue/Restart hidden.
    expect(dom.playButton.classList.contains('hidden')).toBe(false);
    expect(dom.continueButton.classList.contains('hidden')).toBe(true);
  });

  test('startGame resets state, clears saved progress, and starts level 1', () => {
    gameState.level = 3;
    startGame();
    expect(storageMock.clearGameProgress).toHaveBeenCalled();
    expect(gameState.level).toBe(1);
    expect(dom.gameBoardContainer.classList.contains('hidden')).toBe(false);
  });

  test('restartGameFromBeginning clears progress then starts a new game', () => {
    gameState.level = 2;
    restartGameFromBeginning();
    expect(storageMock.clearGameProgress).toHaveBeenCalled();
    expect(gameState.level).toBe(1);
  });

  test('continueGame starts a new game when there is no saved progress', () => {
    gameState.level = 5;
    continueGame();
    expect(gameState.level).toBe(1);
  });

  test('continueGame restores saved state and generates a fresh board when none was saved', () => {
    storageMock.loadGameProgress.mockReturnValueOnce({
      level: 2,
      lives: 2,
      score: 40,
      totalScore: 100,
      movesLeft: 5,
      timer: 20,
      objectives: { betaLeft: 1 },
      boardState: [],
    });
    continueGame();
    expect(gameState.level).toBe(2);
    expect(gameState.lives).toBe(2);
    expect(gameState.totalScore).toBe(100);
    // Config default (3) is overwritten by the saved progress value (1).
    expect(gameState.betaLeft).toBe(1);
    expect(boardMock.generateGameBoard).toHaveBeenCalled();
    expect(timerMock.startTimer).toHaveBeenCalled();
  });

  test('continueGame falls back to a new game when the saved level no longer exists', () => {
    storageMock.loadGameProgress.mockReturnValueOnce({
      level: 999,
      lives: 1,
      score: 0,
      totalScore: 0,
      movesLeft: 0,
      timer: 0,
      objectives: {},
      boardState: [],
    });
    continueGame();
    expect(gameState.level).toBe(1);
    expect(storageMock.clearGameProgress).toHaveBeenCalled();
  });

  const goodSave = () => ({
    level: 2,
    lives: 2,
    score: 40,
    totalScore: 100,
    movesLeft: 5,
    timer: 20,
    objectives: { betaLeft: 1 },
    boardState: validBoard(),
  });

  test.each([
    ['lives is missing', (s) => { delete s.lives; }],
    ['lives is a string', (s) => { s.lives = '5'; }],
    ['lives is too high', (s) => { s.lives = INITIAL_LIVES + 1; }],
    ['level is 99', (s) => { s.level = 99; }],
    ['movesLeft is negative', (s) => { s.movesLeft = -1; }],
    ['timer is not a number', (s) => { s.timer = NaN; }],
    ['objectives do not match the level', (s) => { s.objectives = { alphaLeft: 1 }; }],
    ['objectives are missing', (s) => { delete s.objectives; }],
  ])('continueGame starts a new game and says so when %s', (_name, damage) => {
    const save = goodSave();
    damage(save);
    storageMock.loadGameProgress.mockReturnValueOnce(save);
    continueGame();
    expect(gameState.level).toBe(1);
    expect(gameState.lives).toBe(INITIAL_LIVES);
    expect(storageMock.clearGameProgress).toHaveBeenCalled();
  });

  test.each([
    ['the wrong size', [['🎻', '🎹'], ['🎷', '🎺']]],
    ['an unknown symbol', (() => { const b = validBoard(); b[3][3] = 'X'; return b; })()],
    ['not an array', 'nope'],
  ])('continueGame keeps the progress and makes a fresh board when the board is %s', (_name, board) => {
    const save = goodSave();
    save.boardState = board;
    storageMock.loadGameProgress.mockReturnValueOnce(save);
    continueGame();
    expect(gameState.level).toBe(2);
    expect(gameState.lives).toBe(2);
    expect(gameState.totalScore).toBe(100);
    expect(storageMock.clearGameProgress).not.toHaveBeenCalled();
    expect(boardMock.generateGameBoard).toHaveBeenCalled();
  });

  test('continueGame recreates the board from saved cell content instead of generating a new one', () => {
    storageMock.loadGameProgress.mockReturnValueOnce({
      level: 1,
      lives: 3,
      score: 10,
      totalScore: 10,
      movesLeft: 8,
      timer: 0,
      objectives: { alphaLeft: 2 },
      boardState: validBoard('🎻'),
    });
    continueGame();
    expect(boardMock.generateGameBoard).not.toHaveBeenCalled();
    expect(dom.gameBoard.children.length).toBe(BOARD_SIZE * BOARD_SIZE);
    expect(dom.gameBoard.children[0].textContent).toBe('🎻');
  });

  test('restartLevel hides modals and restarts the current level', () => {
    gameState.level = 2;
    dom.gameOverModal.classList.remove('hidden');
    restartLevel();
    expect(dom.gameOverModal.classList.contains('hidden')).toBe(true);
    expect(dom.restartLevelModal.classList.contains('hidden')).toBe(true);
    expect(gameState.level).toBe(2);
    expect(gameState.movesLeft).toBe(mockLevels[1].moves);
  });

  test('nextLevel advances without saving the result again, which handleLevelWin owns', () => {
    gameState.level = 1;
    // totalScore is kept live in sync with score during play (see
    // boardController.js), so by the time nextLevel() runs it already
    // reflects the level just completed — nextLevel() must not add score again.
    gameState.score = 50;
    gameState.totalScore = 50;
    dom.nextLevelModal.classList.remove('hidden');
    nextLevel();
    expect(gameState.totalScore).toBe(50);
    expect(storageMock.saveHighestLevel).not.toHaveBeenCalled();
    expect(storageMock.saveGameProgress).not.toHaveBeenCalled();
    expect(gameState.level).toBe(2);
    expect(dom.nextLevelModal.classList.contains('hidden')).toBe(true);
    expect(storageMock.saveHighScore).not.toHaveBeenCalled();
  });

  test('nextLevel does nothing on the final level, which handleLevelWin owns', () => {
    gameState.level = mockLevels.length;
    gameState.score = 30;
    gameState.totalScore = 70;
    dom.nextLevelModal.classList.remove('hidden');
    nextLevel();
    // The end-of-game flow lives in handleLevelWin(): nextLevel() must not
    // save the high score, clear progress or show the congratulations modal.
    expect(gameState.level).toBe(mockLevels.length);
    expect(gameState.totalScore).toBe(70);
    expect(storageMock.saveHighScore).not.toHaveBeenCalled();
    expect(storageMock.saveHighestLevel).not.toHaveBeenCalled();
    expect(storageMock.clearGameProgress).not.toHaveBeenCalled();
    expect(dom.congratsModal.classList.contains('hidden')).toBe(true);
    expect(dom.nextLevelModal.classList.contains('hidden')).toBe(false);
  });

  test('autoSaveProgress saves while a level is in progress', () => {
    gameState.level = 1;
    gameState.levelComplete = false;
    autoSaveProgress();
    expect(storageMock.saveGameProgress).toHaveBeenCalled();
  });

  test('autoSaveProgress does not save once the level is complete', () => {
    gameState.level = 1;
    gameState.levelComplete = true;
    autoSaveProgress();
    expect(storageMock.saveGameProgress).not.toHaveBeenCalled();
  });

  test('autoSaveProgress does not save at the menu (level 0)', () => {
    gameState.level = 0;
    gameState.levelComplete = false;
    autoSaveProgress();
    expect(storageMock.saveGameProgress).not.toHaveBeenCalled();
  });

  describe('timer display is set as soon as a level starts', () => {
    test('startLevel shows the full level time before the first tick, with no low-time style', () => {
      startLevel(1);
      expect(dom.timerDisplay.textContent).toBe(`Time: ${utils.formatTime(mockLevels[0].timer)}`);
      expect(dom.timerDisplay.classList.contains('low-time')).toBe(false);
    });

    test('a new level clears a stale low-time display left by the previous level', () => {
      dom.timerDisplay.textContent = 'Time: 0:06';
      dom.timerDisplay.classList.add('low-time');
      startLevel(2);
      expect(dom.timerDisplay.textContent).toBe(`Time: ${utils.formatTime(mockLevels[1].timer)}`);
      expect(dom.timerDisplay.classList.contains('low-time')).toBe(false);
    });

    test('continueGame shows the restored timer immediately', () => {
      storageMock.loadGameProgress.mockReturnValueOnce({
        level: 1, lives: 3, score: 0, totalScore: 0, movesLeft: 8, timer: 15,
        objectives: { alphaLeft: 2 }, boardState: [],
      });
      continueGame();
      expect(dom.timerDisplay.textContent).toBe('Time: 0:15');
      expect(dom.timerDisplay.classList.contains('low-time')).toBe(false);
    });

    test('continueGame shows the full time when a saved no-timer level is resumed with the timer on', () => {
      storageMock.loadGameProgress.mockReturnValueOnce({
        level: 1, lives: 3, score: 0, totalScore: 0, movesLeft: 8, timer: 0,
        objectives: { alphaLeft: 2 }, boardState: [],
      });
      continueGame();
      expect(gameState.timer).toBe(mockLevels[0].timer);
      expect(dom.timerDisplay.textContent).toBe(`Time: ${utils.formatTime(mockLevels[0].timer)}`);
    });
  });

  describe('saved game changed in another tab', () => {
    test('on the home screen it refreshes the menu and shows no modal', () => {
      storageMock.loadGameProgress.mockReturnValue({ level: 1 });
      handleSavedGameChangedElsewhere();
      expect(dom.otherTabModal.classList.contains('hidden')).toBe(true);
      expect(dom.continueButton.classList.contains('hidden')).toBe(false);
      storageMock.loadGameProgress.mockReturnValue(null);
    });

    test('during a level it stops the timer and opens the modal', () => {
      dom.gameBoardContainer.classList.remove('hidden');
      gameState.timerActive = true;
      handleSavedGameChangedElsewhere();
      expect(timerMock.stopTimer).toHaveBeenCalled();
      expect(gameState.timerActive).toBe(false);
      expect(dom.otherTabModal.classList.contains('hidden')).toBe(false);
    });

    test('Use this tab saves this tab game and resumes the timer', () => {
      dom.gameBoardContainer.classList.remove('hidden');
      gameState.timerActive = true;
      handleSavedGameChangedElsewhere();
      useThisTab();
      expect(storageMock.saveGameProgress).toHaveBeenCalled();
      expect(timerMock.startTimer).toHaveBeenCalled();
      expect(gameState.timerActive).toBe(true);
      expect(dom.otherTabModal.classList.contains('hidden')).toBe(true);
    });

    test('Go home keeps the other tab save and shows the menu', () => {
      dom.gameBoardContainer.classList.remove('hidden');
      handleSavedGameChangedElsewhere();
      leaveForOtherTab();
      expect(storageMock.saveGameProgress).not.toHaveBeenCalled();
      expect(dom.otherTabModal.classList.contains('hidden')).toBe(true);
    });
  });
});
