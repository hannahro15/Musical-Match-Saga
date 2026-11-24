
// Board and match logic
import { swapCellContents } from './game.js';
import { SYMBOL_TO_CLASS } from './constants.js';

/**
 * Applies the symbol-specific background class to a cell, clearing any prior one.
 * @param {HTMLElement} cell
 */
export function updateCellClass(cell) {
  Object.values(SYMBOL_TO_CLASS).forEach(cls => cell.classList.remove(cls));
  const symbolClass = SYMBOL_TO_CLASS[cell.textContent];
  if (symbolClass) cell.classList.add(symbolClass);
}

/**
 * Returns all cell elements from the game board.
 * @param {HTMLElement} gameBoard
 * @returns {HTMLElement[]}
 */
function getBoardCells(gameBoard) {
  const cells = Array.from(gameBoard.querySelectorAll('.cell'));
  return cells.length > 0 ? cells : Array.from(gameBoard.children);
}


/**
 * Returns a 2D grid of cell elements.
 * @param {HTMLElement} gameBoard
 * @param {number} BOARD_SIZE
 * @returns {HTMLElement[][]}
 */
export function getCellGrid(gameBoard, BOARD_SIZE) {
  const allCells = getBoardCells(gameBoard);
  const grid = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    grid.push(allCells.slice(row * BOARD_SIZE, (row + 1) * BOARD_SIZE));
  }
  return grid;
}


/**
 * Finds all horizontal and vertical match groups (3+ in a row) on the board.
 * @param {HTMLElement} gameBoard
 * @param {number} BOARD_SIZE
 * @returns {HTMLElement[][]}
 */
export function findMatches(gameBoard, BOARD_SIZE) {
  const grid = getCellGrid(gameBoard, BOARD_SIZE);
  const matchedGroups = [];
  const visited = new Set();
  function scanLineForMatches(line) {
    let startIndex = 0;
    while (startIndex <= line.length - 3) {
      const symbol = line[startIndex].textContent;
      if (!symbol) { startIndex++; continue; }
      let endIndex = startIndex + 1;
      while (endIndex < line.length && line[endIndex].textContent === symbol) endIndex++;
      if (endIndex - startIndex >= 3) {
        const group = [];
        for (let i = startIndex; i < endIndex; i++) {
          if (!visited.has(line[i])) {
            group.push(line[i]);
            visited.add(line[i]);
          }
        }
        if (group.length > 0) matchedGroups.push(group);
      }
      startIndex = endIndex;
    }
  }
  for (let row = 0; row < BOARD_SIZE; row++) scanLineForMatches(grid[row]);
  for (let col = 0; col < BOARD_SIZE; col++) scanLineForMatches(grid.map(row => row[col]));
  return matchedGroups;
}


/**
 * Returns a random symbol that won't create an immediate match at (row, col).
 * @param {string[][]} grid
 * @param {number} row
 * @param {number} col
 * @param {string[]} SYMBOLS
 * @returns {string}
 */
export function getSafeSymbol(grid, row, col, SYMBOLS) {
  const forbiddenSymbols = new Set();
  if (col >= 2 && grid[row][col - 1] === grid[row][col - 2]) forbiddenSymbols.add(grid[row][col - 1]);
  if (row >= 2 && grid[row - 1][col] === grid[row - 2][col]) forbiddenSymbols.add(grid[row - 1][col]);
  const availableSymbols = SYMBOLS.filter(symbol => !forbiddenSymbols.has(symbol));
  return availableSymbols[Math.floor(Math.random() * availableSymbols.length)];
}


/**
 * Generates a new game board with random symbols, ensuring at least one possible move.
 * @param {HTMLElement} gameBoard
 * @param {number} BOARD_SIZE
 * @param {string[]} SYMBOLS
 * @param {Function} getSafeSymbol
 * @param {Function} hasPossibleMoves
 * @param {Function} wireUpCellEvents
 */
export function generateGameBoard(gameBoard, BOARD_SIZE, SYMBOLS, getSafeSymbol, hasPossibleMoves, wireUpCellEvents) {
  // A dead board leaves the player unable to move or lose, so try far more
  // random boards than a normal game needs, then fall back to a known move.
  const ATTEMPT_LIMIT = 1000;
  let attempts = 0;
  let hasMove;
  do {
    renderBoard(gameBoard, () => {
      const grid = Array.from({ length: BOARD_SIZE }, () => []);
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          grid[row][col] = getSafeSymbol(grid, row, col, SYMBOLS);
        }
      }
      return grid.flat();
    }, BOARD_SIZE);
    hasMove = hasPossibleMoves(gameBoard, BOARD_SIZE);
    attempts++;
  } while (!hasMove && attempts < ATTEMPT_LIMIT);

  if (!hasMove) {
    // Deterministic fallback: the first row is A A B A, so swapping B with A
    // makes three in a row. Other rows use a cyclic pattern that cannot create
    // a match on its own.
    renderBoard(gameBoard, () => {
      const symbols = SYMBOLS.length ? SYMBOLS : ['?'];
      const a = symbols[0];
      const b = symbols[1] || a;
      return Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
        const row = Math.floor(index / BOARD_SIZE);
        const col = index % BOARD_SIZE;
        if (row === 0) {
          if (col === 0 || col === 1 || col === 3) return a;
          if (col === 2) return b;
        }
        return symbols[index % symbols.length];
      });
    }, BOARD_SIZE);
  }

  // Always re-attach listeners after board generation
  if (typeof wireUpCellEvents === 'function') {
    wireUpCellEvents();
  }
}

// Replaces the board with one cell per symbol. `symbolsAt` returns the flat
// list, so the random and fallback paths share the DOM code.
function renderBoard(gameBoard, symbolsAt, BOARD_SIZE) {
  gameBoard.innerHTML = '';
  const symbols = symbolsAt();
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const symbol = symbols[row * BOARD_SIZE + col];
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.textContent = symbol;
      updateCellClass(cell);
      cell.draggable = true;
      cell.tabIndex = 0;
      cell.setAttribute('role', 'button');
      cell.setAttribute('aria-label', `Game tile: ${symbol}, row ${row + 1}, column ${col + 1}`);
      gameBoard.appendChild(cell);
    }
  }
}


/**
 * Checks if there is at least one possible move on the board.
 * @param {HTMLElement} gameBoard
 * @param {number} BOARD_SIZE
 * @returns {boolean}
 */
export function hasPossibleMoves(gameBoard, BOARD_SIZE) {
  const allCells = getBoardCells(gameBoard);

  function trySwapAndCheck(idx1, idx2) {
    swapCellContents(allCells[idx1], allCells[idx2]);
    const hasMatch = findMatches(gameBoard, BOARD_SIZE).length > 0;
    swapCellContents(allCells[idx1], allCells[idx2]);
    return hasMatch;
  }

  for (let i = 0; i < allCells.length; i++) {
    const row = Math.floor(i / BOARD_SIZE);
    const col = i % BOARD_SIZE;
    if (col < BOARD_SIZE - 1 && trySwapAndCheck(i, i + 1)) return true;
    if (row < BOARD_SIZE - 1 && trySwapAndCheck(i, i + BOARD_SIZE)) return true;
  }
  return false;
}


/**
 * Reshuffles the board if no moves are possible, or after matches are cleared.
 * @param {HTMLElement} gameBoard
 * @param {number} BOARD_SIZE
 * @param {string[]} SYMBOLS
 * @param {Function} getSafeSymbol
 * @param {Function} hasPossibleMoves
 * @param {Function} wireUpCellEvents
 */
export function reshuffleBoard(gameBoard, BOARD_SIZE, SYMBOLS, getSafeSymbol, hasPossibleMoves, wireUpCellEvents) {
  const allCells = getBoardCells(gameBoard);
  let symbols = allCells.map(cell => cell.textContent).filter(Boolean);
  let attempts = 0;
  do {
    for (let i = symbols.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [symbols[i], symbols[j]] = [symbols[j], symbols[i]];
    }
    allCells.forEach((cell, idx) => {
      cell.textContent = symbols[idx] || '';
      updateCellClass(cell);
    });
    attempts++;
    if (attempts > 20) {
      generateGameBoard(gameBoard, BOARD_SIZE, SYMBOLS, getSafeSymbol, hasPossibleMoves, wireUpCellEvents);
      break;
    }
  } while (!hasPossibleMoves(gameBoard, BOARD_SIZE));
  if (typeof wireUpCellEvents === 'function') {
    wireUpCellEvents();
  }
}


/**
 * Drops symbols down to fill empty spaces and refills the board after matches.
 * @param {HTMLElement} gameBoard
 * @param {number} BOARD_SIZE
 * @param {string[]} SYMBOLS
 * @param {Function} getSafeSymbol
 */
export function dropAndRefill(gameBoard, BOARD_SIZE, SYMBOLS, getSafeSymbol) {
  const grid = [];
  const allCells = getBoardCells(gameBoard);
  for (let row = 0; row < BOARD_SIZE; row++) {
    grid[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      grid[row][col] = allCells[row * BOARD_SIZE + col];
    }
  }
  for (let col = 0; col < BOARD_SIZE; col++) {
    let emptySpots = 0;
    for (let row = BOARD_SIZE - 1; row >= 0; row--) {
      if (!grid[row][col].textContent) {
        emptySpots++;
      } else if (emptySpots > 0) {
        grid[row + emptySpots][col].textContent = grid[row][col].textContent;
        updateCellClass(grid[row + emptySpots][col]);
        grid[row][col].textContent = '';
        updateCellClass(grid[row][col]);
      }
    }
    for (let row = 0; row < emptySpots; row++) {
      grid[row][col].textContent = getSafeSymbol(
        grid.map(r => r.map(c => c.textContent)),
        row,
        col,
        SYMBOLS
      );
      updateCellClass(grid[row][col]);
    }
  }
}

