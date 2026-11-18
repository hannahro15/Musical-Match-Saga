// Centralised constants for the game
export const BOARD_SIZE = 7;
export const SYMBOLS = ['🎵', '🎹', '🎻', '🎷', '🎺', '🥁'];
export const INITIAL_LIVES = 5;
export const MOVE_BONUS = 20; // points per move left when a level is won
export const TIME_BONUS = 2; // points per second left when a level is won

// Timer choices for players who need more time (WCAG 2.2.1).
// factor multiplies each level's timer; 'off' has no timer at all.
export const TIMER_MODES = {
  normal: { factor: 1, label: 'Normal' },
  extra: { factor: 2, label: 'Extra time (x2)' },
  off: { factor: 0, label: 'No timer' }
};
export const DEFAULT_TIMER_MODE = 'normal';

export const SYMBOL_TO_CLASS = {
  '🎻': 'cell-violin',
  '🎹': 'cell-piano',
  '🎺': 'cell-trumpet',
  '🥁': 'cell-drum',
  '🎷': 'cell-saxophone',
  '🎵': 'cell-musicalnote'
};
