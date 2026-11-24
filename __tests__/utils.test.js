import { showElement, hideElement, announce, formatScore, formatTime } from '../src/utils.js';

describe('utils', () => {
  test('showElement removes hidden class', () => {
    const el = document.createElement('div');
    el.classList.add('hidden');
    showElement(el);
    expect(el.classList.contains('hidden')).toBe(false);
  });

  test('hideElement adds hidden class', () => {
    const el = document.createElement('div');
    hideElement(el);
    expect(el.classList.contains('hidden')).toBe(true);
  });

  test('showElement does nothing if element is null', () => {
    expect(() => showElement(null)).not.toThrow();
  });

  test('hideElement does nothing if element is null', () => {
    expect(() => hideElement(null)).not.toThrow();
  });
});

describe('formatTime', () => {
  test('formats seconds as minutes and seconds', () => {
    expect(formatTime(90)).toBe('1:30');
    expect(formatTime(5)).toBe('0:05');
    expect(formatTime(180)).toBe('3:00');
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(-4)).toBe('0:00');
    expect(formatTime(undefined)).toBe('0:00');
  });
});

describe('announce', () => {
  let announcer;

  beforeEach(() => {
    announcer = document.createElement('div');
    announcer.id = 'sr-announcer';
    document.body.appendChild(announcer);
  });

  afterEach(() => {
    announcer.remove();
  });

  test('writes the message to the sr-announcer element', () => {
    jest.useFakeTimers();
    announce('Level complete!');
    jest.advanceTimersByTime(50);
    expect(announcer.textContent).toBe('Level complete!');
    jest.useRealTimers();
  });

  test('clears the region immediately so repeated messages still fire aria-live', () => {
    jest.useFakeTimers();
    announcer.textContent = 'Level complete!';
    announce('Level complete!');
    expect(announcer.textContent).toBe('');
    jest.advanceTimersByTime(50);
    expect(announcer.textContent).toBe('Level complete!');
    jest.useRealTimers();
  });

  test('does nothing when the announcer element is missing', () => {
    announcer.remove();
    expect(() => announce('Hello')).not.toThrow();
  });

  test('does nothing for an empty message', () => {
    announcer.textContent = 'previous';
    announce('');
    expect(announcer.textContent).toBe('previous');
  });

  test('formatScore adds thousands separators', () => {
    expect(formatScore(0)).toBe('0');
    expect(formatScore(1240)).toBe('1,240');
    expect(formatScore(113580)).toBe('113,580');
  });
});
