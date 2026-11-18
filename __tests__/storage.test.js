// add tests to storage.js

import { LEVELS } from '../src/levels.js';
import { BOARD_SIZE, SYMBOLS, INITIAL_LIVES } from '../src/constants.js';
import {
  getHighScore,
  saveHighScore,
  getHighestLevel,
  saveHighestLevel,
  saveGameProgress,
  loadGameProgress,
  clearGameProgress,
  canSave,
  isValidSave,
  isValidBoardState,
  isValidSaveExceptBoard
} from '../src/storage.js';

describe('storage.js', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('getHighScore returns 0 if no score saved', () => {
    expect(getHighScore()).toBe(0);
  });

  test('saveHighScore saves a new high score', () => {
    expect(saveHighScore(100)).toBe(true);
    expect(getHighScore()).toBe(100);
  });

  test('saveHighScore does not update if score is lower', () => {
    saveHighScore(100);
    expect(saveHighScore(50)).toBe(false);
    expect(getHighScore()).toBe(100);
  });

  test('getHighestLevel returns 0 if no level saved', () => {
    expect(getHighestLevel()).toBe(0);
  });

  test('saveHighestLevel saves a new highest level', () => {
    expect(saveHighestLevel(5)).toBe(true);
    expect(getHighestLevel()).toBe(5);
  });

  test('saveHighestLevel does not update if level is lower', () => {
    saveHighestLevel(5);
    expect(saveHighestLevel(3)).toBe(false);
    expect(getHighestLevel()).toBe(5);
  });

  test('saveHighScore updates localStorage correctly', () => {
    saveHighScore(150);
    const storedData = JSON.parse(localStorage.getItem('musicalMatchSaga'));
    expect(storedData.highScore).toBe(150);
  });

  test('saveHighestLevel updates localStorage correctly', () => {
    saveHighestLevel(10);
    const storedData = JSON.parse(localStorage.getItem('musicalMatchSaga'));
    expect(storedData.highestLevel).toBe(10);
  });    

  test('getHighScore handles invalid JSON gracefully', () => {
    localStorage.setItem('musicalMatchSaga', 'invalid json');
    expect(getHighScore()).toBe(0);
  });

  test('getHighestLevel handles invalid JSON gracefully', () => {
    localStorage.setItem('musicalMatchSaga', 'invalid json');
    expect(getHighestLevel()).toBe(0);
  });

  test('savedProgress is cleared after game over', () => {
    saveHighScore(250);
    saveHighestLevel(20);
    localStorage.clear();
    expect(getHighScore()).toBe(0);
    expect(getHighestLevel()).toBe(0);
  });

  test('savedGameProgress stores savedProgress and objectives correctly', () => {
    const savedProgress = {
      level: 3,
      score: 500,
      lives: 2,
      objectives: {
        collectRedLeft: 1,
        collectBlueLeft: 0
      }
    };
    localStorage.setItem('musicalMatchSaga', JSON.stringify({ savedProgress }));
    const storedData = JSON.parse(localStorage.getItem('musicalMatchSaga'));
    expect(storedData.savedProgress).toEqual(savedProgress);
  });

  test('loadGameProgress returns null when nothing has been saved', () => {
    expect(loadGameProgress()).toBeNull();
  });

  test('saveGameProgress persists gameState fields, boardState, and objective counters', () => {
    const gameState = {
      level: 3,
      lives: 2,
      score: 120,
      totalScore: 640,
      movesLeft: 8,
      timer: 20,
      violinLeft: 2,
      pianoLeft: 0
    };
    const boardState = [['🎻', '🎹'], ['', '🥁']];

    expect(saveGameProgress(gameState, boardState)).toBe(true);

    const loaded = loadGameProgress();
    expect(loaded.level).toBe(3);
    expect(loaded.lives).toBe(2);
    expect(loaded.score).toBe(120);
    expect(loaded.totalScore).toBe(640);
    expect(loaded.movesLeft).toBe(8);
    expect(loaded.timer).toBe(20);
    expect(loaded.boardState).toEqual(boardState);
    // movesLeft is excluded from objectives despite ending in "Left".
    expect(loaded.objectives).toEqual({ violinLeft: 2, pianoLeft: 0 });
  });

  test('clearGameProgress removes savedProgress but preserves high score and highest level', () => {
    saveHighScore(300);
    saveHighestLevel(12);
    saveGameProgress({ level: 1, lives: 5, score: 0, totalScore: 0, movesLeft: 10, timer: 30 }, []);

    expect(clearGameProgress()).toBe(true);

    expect(loadGameProgress()).toBeNull();
    expect(getHighScore()).toBe(300);
    expect(getHighestLevel()).toBe(12);
  });

  test('clearGameProgress returns false when there is nothing to clear', () => {
    expect(clearGameProgress()).toBe(false);

    saveHighScore(50); // data exists, but no savedProgress key
    expect(clearGameProgress()).toBe(false);
  });

  test('saveHighScore returns false when localStorage.setItem throws', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    expect(saveHighScore(100)).toBe(false);
    setItemSpy.mockRestore();
  });

  test('canSave is true when localStorage works', () => {
    expect(canSave()).toBe(true);
  });

  test('canSave is false when localStorage.setItem throws', () => {
    const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(canSave()).toBe(false);
    spy.mockRestore();
  });

  describe('isValidSave', () => {
    const goodSave = () => {
      const objectives = {};
      LEVELS[0].objectives.forEach((o) => { objectives[o.label + 'Left'] = o.count; });
      return {
        level: 1,
        lives: INITIAL_LIVES,
        score: 0,
        totalScore: 0,
        movesLeft: 10,
        timer: 30,
        objectives,
        boardState: Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(SYMBOLS[0]))
      };
    };

    test('accepts a good save, including empty cells', () => {
      expect(isValidSave(goodSave())).toBe(true);
      const save = goodSave();
      save.boardState[2][2] = '';
      expect(isValidSave(save)).toBe(true);
    });

    test('rejects things that are not saves', () => {
      expect(isValidSave(null)).toBe(false);
      expect(isValidSave('save')).toBe(false);
      expect(isValidSave([])).toBe(false);
    });

    test.each([
      ['level 99', (s) => { s.level = 99; }],
      ['level 0', (s) => { s.level = 0; }],
      ['a fractional level', (s) => { s.level = 1.5; }],
      ['missing lives', (s) => { delete s.lives; }],
      ['a string for lives', (s) => { s.lives = '5'; }],
      ['too many lives', (s) => { s.lives = INITIAL_LIVES + 1; }],
      ['zero lives', (s) => { s.lives = 0; }],
      ['negative movesLeft', (s) => { s.movesLeft = -1; }],
      ['a string timer', (s) => { s.timer = '30'; }],
      ['an infinite score', (s) => { s.score = Infinity; }],
      ['a missing totalScore', (s) => { delete s.totalScore; }],
      ['missing objectives', (s) => { delete s.objectives; }],
      ['an extra objective key', (s) => { s.objectives.extraLeft = 1; }],
      ['a wrong objective key', (s) => { s.objectives = { wrongLeft: 1 }; }],
      ['a negative objective count', (s) => { const k = Object.keys(s.objectives)[0]; s.objectives[k] = -1; }]
    ])('rejects a save with %s', (_name, damage) => {
      const save = goodSave();
      damage(save);
      expect(isValidSave(save)).toBe(false);
      expect(isValidSaveExceptBoard(save)).toBe(false);
    });

    test.each([
      ['a board that is not an array', 'board'],
      ['too few rows', Array.from({ length: BOARD_SIZE - 1 }, () => Array(BOARD_SIZE).fill(SYMBOLS[0]))],
      ['a row of the wrong size', (() => { const b = goodSave().boardState; b[0] = b[0].slice(1); return b; })()],
      ['a row that is not an array', (() => { const b = goodSave().boardState; b[0] = 'abc'; return b; })()],
      ['an unknown symbol', (() => { const b = goodSave().boardState; b[1][1] = 'X'; return b; })()]
    ])('rejects only the board for %s', (_name, board) => {
      const save = goodSave();
      save.boardState = board;
      expect(isValidBoardState(board)).toBe(false);
      expect(isValidSave(save)).toBe(false);
      expect(isValidSaveExceptBoard(save)).toBe(true);
    });
  });
});
