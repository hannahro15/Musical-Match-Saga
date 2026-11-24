// add tests for levels.js

import { LEVELS, getLevelConfig } from '../src/levels.js';
import { checkWinCondition } from '../src/boardController.js';
import { gameState } from '../src/gameState.js';
import { SYMBOLS, SYMBOL_TO_CLASS, SYMBOL_TO_LABEL } from '../src/constants.js';

describe('LEVELS', () => {

  test('LEVELS is an array of level configurations', () => {
    expect(Array.isArray(LEVELS)).toBe(true);
    expect(LEVELS.length).toBeGreaterThan(0);
    LEVELS.forEach(level => {
      expect(level).toHaveProperty('objectives');
      expect(level).toHaveProperty('moves');
      expect(level).toHaveProperty('timer');
      expect(typeof level.moves).toBe('number');
      expect(typeof level.timer).toBe('number');
    });
  });


  test('every level config is valid', () => {
    LEVELS.forEach((level, index) => {
      expect(Number.isInteger(level.moves) && level.moves > 0).toBe(true);
      expect(Number.isInteger(level.timer) && level.timer > 0).toBe(true);
      const seen = new Set();
      level.objectives.forEach((objective) => {
        expect(SYMBOLS).toContain(objective.symbol);
        expect(SYMBOL_TO_CLASS[objective.symbol]).toBeTruthy();
        expect(objective.label).toBe(SYMBOL_TO_LABEL[objective.symbol]);
        expect(Number.isInteger(objective.count) && objective.count >= 1).toBe(true);
        expect(seen.has(objective.symbol)).toBe(false);
        seen.add(objective.symbol);
      });
    });
  });

  test('LEVELS has unique objectives for each level', () => {
    const objectiveSets = LEVELS.map(level => JSON.stringify(level.objectives));
    const uniqueObjectiveSets = new Set(objectiveSets);
    expect(uniqueObjectiveSets.size).toBe(LEVELS.length);
  });

  test('valid level returns the correct level configuration', () => {
    const levelIndex = 0;
    const levelConfig = LEVELS[levelIndex];
    expect(levelConfig).toBeDefined();
    expect(levelConfig).toHaveProperty('objectives');
    expect(levelConfig).toHaveProperty('moves');
    expect(levelConfig).toHaveProperty('timer');
  });

  test('invalid level index returns undefined', () => {
    const levelIndex = -1;
    const levelConfig = LEVELS[levelIndex];
    expect(levelConfig).toBeUndefined();
  });

  test('levels do not carry the unused winCondition, distractors or note fields', () => {
    LEVELS.forEach(level => {
      expect(level).not.toHaveProperty('winCondition');
      expect(level).not.toHaveProperty('distractors');
      expect(level).not.toHaveProperty('note');
    });
  });

  test('objectives have valid symbols and counts', () => {
    LEVELS.forEach(level => {
      level.objectives.forEach(obj => {
        expect(typeof obj.symbol).toBe('string');
        expect(typeof obj.label).toBe('string');
        expect(typeof obj.count).toBe('number');
        expect(obj.count).toBeGreaterThan(0);
      });
    });
  });

  test('getLevelConfig returns correct config for valid level index', () => {
    const levelNum = 1;
    const config = getLevelConfig(levelNum);
    expect(config).toBe(LEVELS[levelNum - 1]);
  });

  test('getLevelConfig returns undefined for invalid level index', () => {
    const levelNum = 999;
    const config = getLevelConfig(levelNum);
    expect(config).toBeUndefined();
  });
});

describe('checkWinCondition', () => {

  test('is true for every level when all its objectives are met', () => {
    LEVELS.forEach(level => {
      level.objectives.forEach(obj => {
        gameState[obj.label + 'Left'] = 0;
      });
      expect(checkWinCondition(level)).toBe(true);
    });
  });

  test('is false for every level when its first objective is unmet', () => {
    LEVELS.forEach(level => {
      level.objectives.forEach(obj => {
        gameState[obj.label + 'Left'] = 0;
      });
      gameState[level.objectives[0].label + 'Left'] = 1;
      expect(checkWinCondition(level)).toBe(false);
    });
  });
});
