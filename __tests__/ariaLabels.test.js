import fs from 'fs';
import path from 'path';

describe('index.html aria-labels', () => {
  beforeAll(() => {
    const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
    document.documentElement.innerHTML = html;
  });

  test('buttons with visible text do not repeat it in an aria-label', () => {
    const buttons = [...document.querySelectorAll('button[aria-label]')];
    const repeating = buttons.filter((button) => button.textContent.trim() !== '' && !button.classList.contains('close'));
    expect(repeating.map((button) => button.id)).toEqual([]);
  });

  test('the x close buttons keep their "Close" label', () => {
    const closeButtons = [...document.querySelectorAll('button.close')];
    expect(closeButtons.length).toBeGreaterThan(0);
    closeButtons.forEach((button) => {
      expect(button.getAttribute('aria-label')).toBe('Close');
    });
  });

  test.each([
    'highScoreDisplay',
    'highestLevelDisplay',
    'levelDisplay',
    'livesDisplay',
    'movesDisplay',
    'scoreDisplay',
    'timerDisplay',
    'totalScoreDisplay'
  ])('#%s has no aria-label', (id) => {
    expect(document.getElementById(id).hasAttribute('aria-label')).toBe(false);
  });
});
