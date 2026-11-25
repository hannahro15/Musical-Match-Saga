// storage.js - localStorage utilities for game data persistence
import { isObjectiveKey } from './gameState.js';
import { LEVELS } from './levels.js';
import { BOARD_SIZE, SYMBOLS, INITIAL_LIVES, TIMER_MODES, DEFAULT_TIMER_MODE } from './constants.js';

export const STORAGE_KEY = 'musicalMatchSaga';
// Kept apart from the game save so it survives a new game and doesn't
// trigger the "changed in another tab" warning.
const TIMER_MODE_KEY = 'musicalMatchSaga.timerMode';

function readStore() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : null;
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (e) {
    console.error('Error reading from localStorage:', e);
    return {};
  }
}

function writeStore(parsed) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    return true;
  } catch (e) {
    console.error('Error writing to localStorage:', e);
    return false;
  }
}

// Returns true only if this browser lets us write to and remove from
// localStorage (it can be blocked, or full).
export function canSave() {
  try {
    const testKey = STORAGE_KEY + '.test';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function getHighScore() {
  const score = readStore().highScore;
  return isNumberAtLeastZero(score) ? score : 0;
}

export function saveHighScore(score) {
  const parsed = readStore();

  // Only update if new score is higher
  if (isNumberAtLeastZero(score) && score > (isNumberAtLeastZero(parsed.highScore) ? parsed.highScore : 0)) {
    parsed.highScore = score;
    return writeStore(parsed); // true indicates new high score
  }
  return false;
}

export function getHighestLevel() {
  const level = readStore().highestLevel;
  return isNumberAtLeastZero(level) ? Math.min(level, LEVELS.length) : 0;
}

export function saveHighestLevel(level) {
  const parsed = readStore();

  // Only update if new level is higher
  if (isNumberAtLeastZero(level) && level > (isNumberAtLeastZero(parsed.highestLevel) ? parsed.highestLevel : 0)) {
    parsed.highestLevel = level;
    return writeStore(parsed);
  }
  return false;
}

export function saveGameProgress(gameState, boardState) {
  const parsed = readStore();

  parsed.savedProgress = {
    level: gameState.level,
    lives: gameState.lives,
    score: gameState.score,
    totalScore: gameState.totalScore,
    movesLeft: gameState.movesLeft,
    timer: gameState.timer,
    boardState: boardState,
    timestamp: Date.now()
  };

  // Save objective counters (e.g., violinLeft, pianoLeft, etc.)
  const objectives = {};
  for (const key in gameState) {
    if (isObjectiveKey(key)) {
      objectives[key] = gameState[key];
    }
  }
  parsed.savedProgress.objectives = objectives;

  return writeStore(parsed);
}

// An empty board tells Continue to generate a fresh board for this level.
export function saveLevelStart(level, lives, totalScore, timerMode) {
  const config = LEVELS[level - 1];
  const progress = {
    level, lives, score: 0, totalScore,
    movesLeft: config.moves,
    timer: config.timer * (TIMER_MODES[timerMode] || TIMER_MODES.normal).factor
  };
  config.objectives.forEach(({ label, count }) => {
    progress[label + 'Left'] = count;
  });
  return saveGameProgress(progress, []);
}

export function loadGameProgress() {
  return readStore().savedProgress || null;
}

export function clearGameProgress() {
  const parsed = readStore();
  if (parsed.savedProgress) {
    delete parsed.savedProgress;
    return writeStore(parsed);
  }
  return false;
}

function isNumberAtLeastZero(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isWholeNumberInRange(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max;
}

// True if boardState is BOARD_SIZE rows of BOARD_SIZE entries, each a symbol
// from SYMBOLS or ''.
export function isValidBoardState(boardState) {
  return (
    Array.isArray(boardState) &&
    boardState.length === BOARD_SIZE &&
    boardState.every(
      (row) =>
        Array.isArray(row) &&
        row.length === BOARD_SIZE &&
        row.every((cell) => cell === '' || SYMBOLS.includes(cell))
    )
  );
}

// True if everything in a save except the board is usable.
export function isValidSaveExceptBoard(save) {
  if (!save || typeof save !== 'object' || Array.isArray(save)) return false;

  if (!isWholeNumberInRange(save.level, 1, LEVELS.length)) return false;
  if (!isWholeNumberInRange(save.lives, 1, INITIAL_LIVES)) return false;
  for (const field of ['movesLeft', 'timer', 'score', 'totalScore']) {
    if (!isNumberAtLeastZero(save[field])) return false;
  }

  const objectives = save.objectives;
  if (!objectives || typeof objectives !== 'object' || Array.isArray(objectives)) return false;
  const expectedKeys = (LEVELS[save.level - 1].objectives || []).map((o) => o.label + 'Left');
  const savedKeys = Object.keys(objectives);
  if (savedKeys.length !== expectedKeys.length) return false;
  return expectedKeys.every(
    (key) => Object.prototype.hasOwnProperty.call(objectives, key) && isNumberAtLeastZero(objectives[key])
  );
}

// True if the whole save, including the board, is usable.
export function isValidSave(save) {
  return isValidSaveExceptBoard(save) && isValidBoardState(save.boardState);
}

export function getTimerMode() {
  try {
    const mode = localStorage.getItem(TIMER_MODE_KEY);
    return Object.prototype.hasOwnProperty.call(TIMER_MODES, mode) ? mode : DEFAULT_TIMER_MODE;
  } catch {
    return DEFAULT_TIMER_MODE;
  }
}

export function saveTimerMode(mode) {
  if (!Object.prototype.hasOwnProperty.call(TIMER_MODES, mode)) return false;
  try {
    localStorage.setItem(TIMER_MODE_KEY, mode);
    return true;
  } catch {
    return false;
  }
}
