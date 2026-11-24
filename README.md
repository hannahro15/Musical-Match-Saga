# Musical Match Saga

[![Tests](https://github.com/hannahro15/Musical-Match-Saga/actions/workflows/test.yml/badge.svg)](https://github.com/hannahro15/Musical-Match-Saga/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Play now](https://img.shields.io/badge/play-live%20on%20GitHub%20Pages-6c5ce7.svg)][live]

Musical Match Saga is a free match-3 puzzle game with a musical twist, for desktop and mobile browsers. Swap instruments to make rows of three or more, hit each level's targets before you run out of moves or time, and work your way through 20 levels.

### ▶ [Play Musical Match Saga][live]

<p align="center">
  <img src="images/home-screen.jpg" width="250" alt="Home screen: the Musical Match Saga title in purple script, Best Score and Highest Level boxes, and Play Game and How to Play buttons.">
  <img src="images/home-continue-screen.jpg" width="250" alt="Home screen for a returning player: Best Score 13580, Highest Level 11, and Continue Your Adventure, How to Play and Restart Game buttons.">
  <img src="images/game-screen.jpg" width="250" alt="Level 1 in play: the level, lives, objectives, moves, score and timer above a 7 by 7 board of instrument tiles.">
</p>

---

## Table of Contents

1. [How to Play](#how-to-play)
2. [Features](#features)
3. [Getting Started](#getting-started)
4. [Technologies Used](#technologies-used)
5. [Project Structure](#project-structure)
6. [Testing](#testing)
7. [Contributing](#contributing)
8. [License](#license)
9. [Credits](#credits)

---

## How to Play

1. Press **Play Game** to start level 1.
2. Swap two neighbouring tiles to line up 3 or more of the same instrument.
3. Collect the instruments shown at the top of the screen before you run out of moves or time.
4. If you run out of moves or time, you lose a life and can try the level again. You start with 5 lives.
5. Lose all 5 and it's game over: you can play again from level 1 or go back to the home screen.
6. Your progress is saved as you play. Press **Continue Your Adventure** on the home screen to carry on later.

### Controls

- **Mouse:** drag a tile onto a neighbour, or click a tile and then click a neighbour.
- **Touch:** swipe a tile towards a neighbour, or tap a tile and then tap a neighbour.
- **Keyboard:** Tab to a tile and press Enter or Space to select it, then Tab to a neighbour and press Enter or Space to swap.

### Scoring

| Match | Points |
| --- | --- |
| 3 tiles | 10 |
| 4 tiles | 20 |
| 5 tiles | 40 |
| 6 or more tiles | 60 |

On top of that:

- **Several matches at once:** +20 for each match after the first.
- **Level bonus:** when you win a level, +20 for each move left and +2 for each second left.
- **Chain reactions:** when falling tiles make new matches, each wave after the first adds 20 × its place in the chain (+40 for the 2nd wave, +60 for the 3rd, and so on).

---

## Features

- 20 levels, each with its own instruments to collect, move limit and timer
- 5 lives, a running total score, and a game over screen with your final score
- Progress saved in your browser, so you can close the game and carry on later
- Best score and highest level reached shown on the home screen
- Plays with a mouse, touch or keyboard, on desktop and mobile
- Screen reader support, including announcements for matches and level results. Accessibility is a priority and still being improved: see the issues labelled [`accessibility`](https://github.com/hannahro15/Musical-Match-Saga/issues?q=is%3Aissue%20is%3Aopen%20label%3Aaccessibility)
- Respects the reduced-motion setting on your device
- No accounts, ads or tracking: see the [privacy policy](privacy.html)
- An [accessibility statement](accessibility.html) says what has and hasn't been checked

---

## Getting Started

The easiest way to play is the [live version][live]. To run it on your own computer:

### Prerequisites

- A modern web browser
- [Node.js](https://nodejs.org/) 24.x or 26.x, only needed for the tests and the linter

### Installation

1. Clone the repository and go into its folder:
   ```bash
   git clone https://github.com/hannahro15/Musical-Match-Saga.git
   cd Musical-Match-Saga
   ```
2. Install the development dependencies:
   ```bash
   npm install
   ```

### Running the game

The game is plain HTML, CSS and JavaScript, so there's no build step. Start a local web server from the project folder with `npm start`, or use any static server:

```bash
npx serve .
```

Then open the address it prints in your browser (usually `http://localhost:3000`). The Live Server extension in VS Code works too.

Opening `index.html` straight from your file system won't work, because browsers block JavaScript modules on `file://` pages.

---

## Technologies Used

- HTML, CSS and JavaScript (ES modules, no framework or build step)
- [Jest](https://jestjs.io/) with jsdom for testing
- [ESLint](https://eslint.org/) for linting
- GitHub Actions and GitHub Pages for testing and deploying
- [GitHub Copilot](https://github.com/features/copilot) for AI-assisted development

---

## Project Structure

```
Musical-Match-Saga/
│
├── src/                          # game code (ES modules)
│   ├── script.js                 # entry point: wires up menu buttons and starts the game
│   ├── gameController.js         # game flow: starting/continuing levels, lives, saving progress
│   ├── gameState.js              # shared game state (score, moves, objectives, selected tile)
│   ├── levels.js                 # level definitions: moves, time limits, objectives
│   ├── levelOutcomes.js          # what happens when a level is won or lost
│   ├── board.js                  # board logic: generating, finding matches, refilling, reshuffling
│   ├── boardController.js        # handles a swap: checks matches, updates score and objectives
│   ├── boardEventHandlers.js     # connects tile interactions to the board controller
│   ├── interaction.js            # drag, swipe, tap and keyboard input handling
│   ├── events.js                 # attaches input listeners to each tile
│   ├── game.js                   # core helpers: swapping tiles, adjacency, scoring
│   ├── timer.js                  # level countdown timer
│   ├── storage.js                # saves/loads best score and progress in localStorage
│   ├── ui.js                     # updates the HUD (moves, score, lives, timer, objectives)
│   ├── domElements.js            # references to page elements
│   ├── constants.js              # board size, musical symbols, starting lives
│   └── utils.js                  # show/hide helpers and screen-reader announcements
│
├── __tests__/                    # Jest tests, one file for most modules in src/
│
├── styles/
│   ├── base.css                  # shared colours, fonts and layout
│   ├── home.css                  # home/menu screen
│   ├── game.css                  # game board and HUD
│   ├── modals.css                # pop-ups: level complete, level failed, game over, congratulations, how to play, return home
│   └── fonts/                    # self-hosted Pacifico webfont and its licence (OFL.txt)
│
├── images/                       # screenshots and app icons
├── .github/workflows/
│   ├── test.yml                  # runs the Jest tests on pushes to main and on pull requests
│   └── deploy-pages.yml          # runs the tests, then publishes the game to GitHub Pages
│
├── index.html                    # the game page
├── privacy.html                  # privacy policy (no data collected; progress stays in your browser)
├── accessibility.html            # accessibility statement
├── manifest.json                 # web app manifest (name, icons, theme colour)
├── .babelrc                      # Babel config so Jest can run ES modules
├── eslint.config.js              # linting rules
├── jest.config.js                # test configuration
├── package.json                  # dev dependencies and scripts
├── package-lock.json
├── CONTRIBUTING.md               # how to contribute
├── CODE_OF_CONDUCT.md            # community standards
├── LICENSE                       # MIT License
└── README.md
```

### How the pieces fit together

`index.html` loads `src/script.js`, which connects the menu buttons to `gameController.js`. The game controller sets up each level from `levels.js`, builds the board with `board.js`, and starts the timer. When a player swaps two tiles (through `interaction.js` and `boardEventHandlers.js`), `boardController.js` checks for matches, updates the score and objectives in `gameState.js`, and refreshes the HUD through `ui.js`. When the level ends, `levelOutcomes.js` decides what happens next, and `storage.js` saves progress so **Continue Your Adventure** can pick up where you left off.

---

## Testing

The tests use [Jest](https://jestjs.io/) with `babel-jest` and the `jsdom` environment, and live in the `__tests__` folder.

```bash
npm test                 # run all tests
npm run test:coverage    # run them with a coverage report
npm run lint             # check the code with ESLint
```

The coverage report is written to `coverage/lcov-report/index.html`. Open it in your browser to see coverage by file and line.

The coverage report counts every file in `src/` (see `collectCoverageFrom` in `jest.config.js`), including files no test imports directly, so a new untested file shows up at 0% instead of being left out. Across all of `src/` the tests cover about 95% of statements and 83% of branches, and `src/script.js`, the entry point, has its own tests in `__tests__/script.test.js`.

The tests also run automatically on every pull request, and before every deploy.

---

## Contributing

Contributions are welcome, from developers, designers and players alike. Some issues, like testing the game with a screen reader or on different phones, need no coding at all.

To see what's planned and what's already in progress, check the [project board](https://github.com/users/hannahro15/projects/16).

**Please wait to be assigned to an issue before you start working on it or open a pull request.** Comment on the issue to ask for it, and I'll assign it to you.

Read the [contributing guide](CONTRIBUTING.md) to get started. By taking part, you agree to follow the [code of conduct](CODE_OF_CONDUCT.md).

---

## License

The code is licensed under the [MIT License](LICENSE).

---

## Credits

- Created and maintained by Hannah Olbrich.
- Title font: [Pacifico](https://github.com/googlefonts/Pacifico) by The Pacifico Project Authors, licensed under the [SIL Open Font License 1.1](styles/fonts/OFL.txt), not the MIT License.
- Emoji icons from [Unicode](https://unicode.org/emoji/).
- AI-assisted development with GitHub Copilot.

[live]: https://hannahro15.github.io/Musical-Match-Saga/
