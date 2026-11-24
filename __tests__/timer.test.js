// timer.test.js - Unit tests for timer.js
// Add your tests here

import { startTimer, stopTimer, pauseTimerForModal, resumeTimerAfterModal } from '../src/timer.js';
import { gameState } from '../src/gameState.js';
import { jest } from '@jest/globals';
import * as ui from '../src/ui.js';
import * as utils from '../src/utils.js';


describe('timer', () => {
  afterEach(() => {
    stopTimer(gameState);
    gameState.timerActive = true;
    gameState.levelComplete = false;
    gameState.movesLeft = 0;
    gameState.timer = 0;
  });

  test('startTimer is a function', () => {
    expect(typeof startTimer).toBe('function');
  });

  test('the timer decrements every second when started', (done) => {
    document.body.innerHTML = '<div id="timer"></div>';
    const timerDisplay = document.getElementById('timer');
    gameState.timer = 2;
    startTimer(gameState, timerDisplay, () => {});
    setTimeout(() => {
      expect(gameState.timer).toBe(1);
      expect(timerDisplay.textContent).toBe('Time: 0:01');
      done();
    }, 1100);
  });

  test('handelLevelLose is called when timer reaches 0 and moves are left', (done) => {
    document.body.innerHTML = '<div id="timer"></div>';
    const timerDisplay = document.getElementById('timer');
    gameState.timer = 1;
    gameState.movesLeft = 1;
    const handleLevelLose = jest.fn();
    startTimer(gameState, timerDisplay, handleLevelLose);
    setTimeout(() => {
      expect(handleLevelLose).toHaveBeenCalled();
      expect(timerDisplay.textContent).toBe('Time: 0:00');
      done();
    }, 1100);
  });

  test('timer does not go below 0', (done) => {
    document.body.innerHTML = '<div id="timer"></div>';
    const timerDisplay = document.getElementById('timer');
    gameState.timer = 1;
    startTimer(gameState, timerDisplay, () => {});
    setTimeout(() => {
      expect(gameState.timer).toBe(0);
      expect(timerDisplay.textContent).toBe('Time: 0:00');
      done();
    }, 1100);
  });

  test('startTimer does not call handleLevelLose if no moves are left when timer reaches 0', (done) => {
    document.body.innerHTML = '<div id="timer"></div>';
    const timerDisplay = document.getElementById('timer');
    gameState.timer = 1;
    gameState.movesLeft = 0;
    const handleLevelLose = jest.fn();
    startTimer(gameState, timerDisplay, handleLevelLose);
    setTimeout(() => {
      expect(handleLevelLose).not.toHaveBeenCalled();
      expect(timerDisplay.textContent).toBe('Time: 0:00');
      done();
    }, 1100);
  });

  test('stopTimer clears the timer interval', () => {
    gameState.timer = 2;
    startTimer(gameState, undefined, () => {});
    stopTimer(gameState);
    expect(gameState.timerInterval).toBeNull();
  });

  test('updateTimerDisplay updates the timer display element', (done) => {
    document.body.innerHTML = '<div id="timer"></div>';
    const timerDisplay = document.getElementById('timer');
    gameState.timer = 2;
    startTimer(gameState, timerDisplay, () => {});
    setTimeout(() => {
      expect(timerDisplay.textContent).toBe('Time: 0:01');
      done();
    }, 1100);
  });

  test('does not decrement timer or call updateTimerDisplay if timerActive is false', (done) => {
    const timerDisplay = {};
    const spy = jest.spyOn(ui, 'updateTimerDisplay');
    const handleLevelLose = jest.fn();
    gameState.timer = 5;
    gameState.timerActive = false;
    startTimer(gameState, timerDisplay, handleLevelLose);
    setTimeout(() => {
      expect(gameState.timer).toBe(5);
      expect(spy).not.toHaveBeenCalled();
      expect(handleLevelLose).not.toHaveBeenCalled();
      spy.mockRestore();
      done();
    }, 1100);
  });

  test('does not call handleLevelLose if levelComplete is true', (done) => {
    const timerDisplay = {};
    const handleLevelLose = jest.fn();
    gameState.timer = 1;
    gameState.movesLeft = 5;
    gameState.levelComplete = true;
    gameState.timerActive = true;
    startTimer(gameState, timerDisplay, handleLevelLose);
    setTimeout(() => {
      expect(handleLevelLose).not.toHaveBeenCalled();
      done();
    }, 1100);
  });

  test('calls updateTimerDisplay with correct arguments', (done) => {
    const timerDisplay = {};
    const spy = jest.spyOn(ui, 'updateTimerDisplay');
    gameState.timer = 2;
    gameState.timerActive = true;
    startTimer(gameState, timerDisplay, () => {});
    setTimeout(() => {
      expect(spy).toHaveBeenCalledWith(timerDisplay, 1);
      spy.mockRestore();
      done();
    }, 1100);
  });

  test('does not throw if handleLevelLose is not provided', (done) => {
    const timerDisplay = {};
    gameState.timer = 1;
    gameState.movesLeft = 5;
    gameState.levelComplete = false;
    gameState.timerActive = true;
    expect(() => {
      startTimer(gameState, timerDisplay);
    }).not.toThrow();
    setTimeout(done, 1100);
  });

  test('multiple calls to startTimer clear previous interval', (done) => {
    const timerDisplay = {};
    const handleLevelLose = jest.fn();
    gameState.timer = 2;
    gameState.timerActive = true;
    startTimer(gameState, timerDisplay, handleLevelLose);
    const firstInterval = gameState.timerInterval;
    startTimer(gameState, timerDisplay, handleLevelLose);
    expect(gameState.timerInterval).not.toBe(firstInterval);
    setTimeout(done, 1100);
  });

  test('timer stops on gameover or level complete', (done) => {
    const timerDisplay = {};
    const handleLevelLose = jest.fn();
    gameState.timer = 1;
    gameState.movesLeft = 5;
    gameState.levelComplete = false;
    gameState.timerActive = true;
    startTimer(gameState, timerDisplay, handleLevelLose);
    gameState.levelComplete = true; // Simulate level complete
    setTimeout(() => {
      expect(handleLevelLose).not.toHaveBeenCalled();
      done();
    }, 1100);
  });
});
describe('pause while a modal is open', () => {
  afterEach(() => {
    jest.useRealTimers();
    stopTimer(gameState);
    gameState.timerActive = true;
    gameState.levelComplete = false;
    gameState.timer = 0;
  });

  test('timer does not change while paused and continues after resume', () => {
    jest.useFakeTimers();
    document.body.innerHTML = '<div id="timer"></div>';
    const display = document.getElementById('timer');
    const lose = jest.fn();
    gameState.timer = 5;
    gameState.movesLeft = 3;
    gameState.levelComplete = false;
    gameState.timerActive = true;
    startTimer(gameState, display, lose);
    jest.advanceTimersByTime(1000);
    expect(gameState.timer).toBe(4);

    const wasRunning = pauseTimerForModal(gameState);
    jest.advanceTimersByTime(10000);
    expect(gameState.timer).toBe(4);
    expect(lose).not.toHaveBeenCalled();

    resumeTimerAfterModal(gameState, wasRunning);
    jest.advanceTimersByTime(1000);
    expect(gameState.timer).toBe(3);
  });

  test('does not resume a timer that was not running', () => {
    gameState.timerActive = false;
    const wasRunning = pauseTimerForModal(gameState);
    resumeTimerAfterModal(gameState, wasRunning);
    expect(gameState.timerActive).toBe(false);
  });
});

describe('timer screen-reader announcements', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
    stopTimer(gameState);
    gameState.timerActive = true;
    gameState.levelComplete = false;
    gameState.movesLeft = 0;
    gameState.timer = 0;
    document.body.innerHTML = '';
  });

  test('announces at 30s and 10s and at no other time', () => {
    jest.useFakeTimers();
    const announceSpy = jest.spyOn(utils, 'announce').mockImplementation(() => {});
    const timerDisplay = document.createElement('div');
    gameState.timer = 32;
    gameState.timerActive = true;

    startTimer(gameState, timerDisplay, () => {});
    jest.advanceTimersByTime(32000);

    expect(announceSpy).toHaveBeenCalledTimes(2);
    expect(announceSpy).toHaveBeenNthCalledWith(1, '30 seconds left');
    expect(announceSpy).toHaveBeenNthCalledWith(2, '10 seconds left');
  });

  test('does not announce while a modal is open or timer is paused', () => {
    jest.useFakeTimers();
    const announceSpy = jest.spyOn(utils, 'announce').mockImplementation(() => {});
    document.body.innerHTML = '<div class="modal"></div>';
    const timerDisplay = document.createElement('div');
    gameState.timer = 31;
    gameState.timerActive = true;

    startTimer(gameState, timerDisplay, () => {});
    jest.advanceTimersByTime(1000);
    expect(announceSpy).not.toHaveBeenCalled();

    const wasRunning = pauseTimerForModal(gameState);
    gameState.timer = 11;
    jest.advanceTimersByTime(2000);
    expect(announceSpy).not.toHaveBeenCalled();
    resumeTimerAfterModal(gameState, wasRunning);
  });

  test('announces each warning once and stays quiet while paused and after resume', () => {
    jest.useFakeTimers();
    const announceSpy = jest.spyOn(utils, 'announce').mockImplementation(() => {});
    const timerDisplay = document.createElement('div');
    gameState.timer = 12;
    gameState.timerActive = true;

    startTimer(gameState, timerDisplay, () => {});
    jest.advanceTimersByTime(2000);
    expect(announceSpy).toHaveBeenCalledTimes(1);
    expect(announceSpy).toHaveBeenCalledWith('10 seconds left');

    const wasRunning = pauseTimerForModal(gameState);
    jest.advanceTimersByTime(2000);
    resumeTimerAfterModal(gameState, wasRunning);
    jest.advanceTimersByTime(2000);
    expect(announceSpy).toHaveBeenCalledTimes(1);
  });
});
