// Level configuration and level-related logic
export const LEVELS = [
  // Level 1: Intro - two objectives, simple
  {
    moves: 15,
    objectives: [
      { symbol: '🎻', label: 'violin', count: 5 },
      { symbol: '🎹', label: 'piano', count: 5 }
    ],
    timer: 75,
  },

  // Level 2: Three objectives introduced, moderate
  {
    moves: 16,
    objectives: [
      { symbol: '🎺', label: 'trumpet', count: 6 },
      { symbol: '🥁', label: 'drum', count: 4 },
      { symbol: '🎻', label: 'violin', count: 4 }
    ],
    timer: 75,
  },

  // Level 3: Three objectives, higher counts introduced
  {
    moves: 16,
    objectives: [
      { symbol: '🎷', label: 'saxophone', count: 8 },
      { symbol: '🎺', label: 'trumpet', count: 6 },
      { symbol: '🎹', label: 'piano', count: 5 }
    ],
    timer: 75,
  },

  // Level 4: Three objectives, musical note introduced as objective
  {
    moves: 18,
    objectives: [
      { symbol: '🎵', label: 'musicalNote', count: 8 },
      { symbol: '🎷', label: 'saxophone', count: 6 },
      { symbol: '🥁', label: 'drum', count: 6 }
    ],
    timer: 75,
  },

  // Level 5: Three objectives, higher counts, timer tightens slightly
  {
    moves: 20,
    objectives: [
      { symbol: '🎻', label: 'violin', count: 8 },
      { symbol: '🎹', label: 'piano', count: 8 },
      { symbol: '🎺', label: 'trumpet', count: 6 }
    ],
    timer: 70,
  },

  // Level 6: Three objectives, distractor symbols, higher counts
  {
    moves: 20,
    objectives: [
      { symbol: '🎺', label: 'trumpet', count: 10 },
      { symbol: '🥁', label: 'drum', count: 8 },
      { symbol: '🎵', label: 'musicalNote', count: 6 }
    ],
    timer: 70,
  },

  // Level 7: Three objectives, more moves than level 6, shorter timer
  {
    moves: 22,
    objectives: [
      { symbol: '🎷', label: 'saxophone', count: 10 },
      { symbol: '🎵', label: 'musicalNote', count: 8 },
      { symbol: '🥁', label: 'drum', count: 6 }
    ],
    timer: 65,
  },

  // Level 8: Timed rush - short timer, more distractors, fast-paced
  {
    moves: 24,
    objectives: [
      { symbol: '🎹', label: 'piano', count: 10 },
      { symbol: '🎻', label: 'violin', count: 10 },
      { symbol: '🎺', label: 'trumpet', count: 8 }
    ],
    timer: 60,
  },

  // Level 9: Four objectives, tight timer
  {
    moves: 26,
    objectives: [
      { symbol: '🎷', label: 'saxophone', count: 12 },
      { symbol: '🥁', label: 'drum', count: 10 },
      { symbol: '🎵', label: 'musicalNote', count: 8 },
      { symbol: '🎺', label: 'trumpet', count: 6 }
    ],
    timer: 55,
    comboChallenge: true,
  },

  // Level 10: Five objectives - end of act one!
  {
    moves: 28,
    objectives: [
      { symbol: '🎻', label: 'violin', count: 12 },
      { symbol: '🎹', label: 'piano', count: 10 },
      { symbol: '🎷', label: 'saxophone', count: 8 },
      { symbol: '🥁', label: 'drum', count: 8 },
      { symbol: '🎵', label: 'musicalNote', count: 6 }
    ],
    timer: 50,
    comboChallenge: true,
  },

  // Level 11: Act two begins - fresh start, two objectives, easier, breathing room before the ramp
  {
    moves: 25,
    objectives: [
      { symbol: '🎺', label: 'trumpet', count: 10 },
      { symbol: '🎵', label: 'musicalNote', count: 8 }
    ],
    timer: 90,
  },

  // Level 12: Three objectives, higher counts
  {
    moves: 26,
    objectives: [
      { symbol: '🎹', label: 'piano', count: 12 },
      { symbol: '🥁', label: 'drum', count: 10 },
      { symbol: '🎺', label: 'trumpet', count: 6 }
    ],
    timer: 85,
  },

  // Level 13: Three objectives, difficulty ramping again
  {
    moves: 28,
    objectives: [
      { symbol: '🎻', label: 'violin', count: 12 },
      { symbol: '🎵', label: 'musicalNote', count: 10 },
      { symbol: '🥁', label: 'drum', count: 8 }
    ],
    timer: 85,
  },

  // Level 14: Four objectives return
  {
    moves: 28,
    objectives: [
      { symbol: '🎹', label: 'piano', count: 12 },
      { symbol: '🎺', label: 'trumpet', count: 10 },
      { symbol: '🎵', label: 'musicalNote', count: 8 },
      { symbol: '🥁', label: 'drum', count: 6 }
    ],
    timer: 80,
  },

  // Level 15: Three objectives, higher counts, high saxophone count challenge
  {
    moves: 30,
    objectives: [
      { symbol: '🎷', label: 'saxophone', count: 14 },
      { symbol: '🎻', label: 'violin', count: 10 },
      { symbol: '🥁', label: 'drum', count: 8 }
    ],
    timer: 80,
  },

  // Level 16: Four objectives, balanced counts
  {
    moves: 30,
    objectives: [
      { symbol: '🎹', label: 'piano', count: 12 },
      { symbol: '🎵', label: 'musicalNote', count: 12 },
      { symbol: '🎻', label: 'violin', count: 10 },
      { symbol: '🥁', label: 'drum', count: 8 }
    ],
    timer: 75,
  },

  // Level 17: Four objectives, more moves and higher counts than level 16, same timer
  {
    moves: 32,
    objectives: [
      { symbol: '🎺', label: 'trumpet', count: 14 },
      { symbol: '🎷', label: 'saxophone', count: 12 },
      { symbol: '🎵', label: 'musicalNote', count: 10 },
      { symbol: '🎹', label: 'piano', count: 8 }
    ],
    timer: 75,
  },

  // Level 18: Five objectives, tight timer
  {
    moves: 32,
    objectives: [
      { symbol: '🎻', label: 'violin', count: 14 },
      { symbol: '🥁', label: 'drum', count: 12 },
      { symbol: '🎺', label: 'trumpet', count: 10 },
      { symbol: '🎵', label: 'musicalNote', count: 8 },
      { symbol: '🎹', label: 'piano', count: 6 }
    ],
    timer: 70,
  },

  // Level 19: Five objectives, very tight timer
  {
    moves: 34,
    objectives: [
      { symbol: '🎷', label: 'saxophone', count: 14 },
      { symbol: '🎹', label: 'piano', count: 14 },
      { symbol: '🥁', label: 'drum', count: 12 },
      { symbol: '🎺', label: 'trumpet', count: 10 },
      { symbol: '🎵', label: 'musicalNote', count: 8 }
    ],
    timer: 65,
    comboChallenge: true,
  },

  // Level 20: Ultimate - all six instruments, the grand finale!
  {
    moves: 35,
    objectives: [
      { symbol: '🎻', label: 'violin', count: 14 },
      { symbol: '🎹', label: 'piano', count: 14 },
      { symbol: '🎺', label: 'trumpet', count: 12 },
      { symbol: '🥁', label: 'drum', count: 10 },
      { symbol: '🎷', label: 'saxophone', count: 10 },
      { symbol: '🎵', label: 'musicalNote', count: 8 }
    ],
    timer: 60,
    comboChallenge: true,
  }
];

export function getLevelConfig(levelNum) {
  return LEVELS[levelNum - 1];
}
