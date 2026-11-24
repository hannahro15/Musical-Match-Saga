// levelOutcomes.js - Handles win/lose outcomes for levels
import { gameState } from './gameState.js';
import { LEVELS } from './levels.js';
import { saveHighScore, saveHighestLevel, clearGameProgress, saveGameProgress } from './storage.js';
import { announce, formatScore } from './utils.js';
import { stopTimer } from './timer.js';
import { MOVE_BONUS, TIME_BONUS, TIMER_MODES } from './constants.js';
import { updateLivesDisplay, updateScoreDisplay, updateTotalScoreDisplay } from './ui.js';

// Show the "New best score!" line of a result modal only when a record was set.
function toggleNewBest(id, isNewBest) {
    const line = document.getElementById(id);
    if (line) line.classList.toggle('hidden', !isNewBest);
}

// Adds points for moves and seconds left to the score and total score, and
// returns a short text describing the bonus for the result modal.
function applyWinBonus() {
    const movesLeft = Math.max(0, Number(gameState.movesLeft) || 0);
    // No time bonus when the timer is off
    const timerOff = gameState.timerMode === 'off';
    const timeLeft = timerOff ? 0 : Math.max(0, Number(gameState.timer) || 0);
    const moveBonus = movesLeft * MOVE_BONUS;
    const timeBonus = timeLeft * TIME_BONUS;
    const total = moveBonus + timeBonus;
    gameState.score += total;
    gameState.totalScore += total;

    const scoreEl = document.getElementById('scoreDisplay');
    const totalEl = document.getElementById('totalScoreDisplay');
    if (scoreEl) updateScoreDisplay(scoreEl, gameState.score);
    if (totalEl) updateTotalScoreDisplay(totalEl, gameState.totalScore);

    return {
        total,
        hasBonus: total > 0,
        text: `Moves left: ${movesLeft} × ${MOVE_BONUS} = +${formatScore(moveBonus)}.` +
            (timerOff ? '' : ` Time left: ${timeLeft}s × ${TIME_BONUS} = +${formatScore(timeBonus)}.`)
    };
}

function showBonus(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

export function handleLevelWin() {
    gameState.levelComplete = true;
    gameState.timerActive = false;
    stopTimer(gameState);
    const isFinalLevel = gameState.level >= LEVELS.length;
    const bonus = applyWinBonus();
    const bonusAnnouncement = bonus.hasBonus && bonus.text ? ` ${bonus.text}` : '';

    if (isFinalLevel) {
        // gameState.totalScore is already kept live in sync with each
        // match's score gain (see boardController.js's
        // updateScoreAndObjectives), so it already includes gameState.score.
        const finalScore = gameState.totalScore;
        gameState.score = 0;

        const isNewBest = saveHighScore(finalScore);
        saveHighestLevel(LEVELS.length);
        clearGameProgress();

        const congratsModal = document.getElementById('congratsModal');
        const congratsFinalScore = document.getElementById('congratsFinalScore');
        if (congratsFinalScore) {
            congratsFinalScore.textContent = `Total Score: ${formatScore(finalScore)}`;
        }
        showBonus('congratsBonus', bonus.text);
        toggleNewBest('congratsNewBest', isNewBest);
        if (congratsModal) congratsModal.classList.remove('hidden');
        announce(isNewBest
            ? `Congratulations! You completed all levels.${bonusAnnouncement} New best score: ${formatScore(finalScore)}!`
            : `Congratulations! You completed all levels with a total score of ${formatScore(finalScore)}.${bonusAnnouncement}`);
        return;
    }

    // Save before showing the modal, so leaving now resumes the next level.
    // Keep the live state on the completed level until Next Level is pressed.
    const nextConfig = LEVELS[gameState.level];
    const nextProgress = {
        level: gameState.level + 1,
        lives: gameState.lives,
        score: 0,
        totalScore: gameState.totalScore,
        movesLeft: nextConfig.moves,
        timer: nextConfig.timer * (TIMER_MODES[gameState.timerMode] || TIMER_MODES.normal).factor
    };
    nextConfig.objectives.forEach(({ label, count }) => {
        nextProgress[label + 'Left'] = count;
    });
    saveHighestLevel(gameState.level);
    saveGameProgress(nextProgress, []);

    // Show next level modal and ensure Next Level button is visible
    const nextLevelModal = document.getElementById('nextLevelModal');
    const confirmNextLevelBtn = document.getElementById('confirmNextLevelBtn');
    showBonus('levelBonus', bonus.text);
    if (nextLevelModal) nextLevelModal.classList.remove('hidden');
    if (confirmNextLevelBtn) confirmNextLevelBtn.classList.remove('hidden');
    announce(`Level ${gameState.level} complete!${bonusAnnouncement} Ready for the next challenge.`);
}

export function handleLevelLose(restartContainer, restartBtn, nextLevelBtn) {
    gameState.levelComplete = true;
    gameState.timerActive = false;
    stopTimer(gameState);

    // Decrement lives and update display
    if (Number.isFinite(gameState.lives) && gameState.lives > 0) {
        gameState.lives--;
        const livesDisplay = document.getElementById('livesDisplay');
        if (livesDisplay) {
            updateLivesDisplay(livesDisplay, gameState.lives);
        }
    }

    // If out of lives, show game over modal instead of restart modal
    if (gameState.lives <= 0) {
        // gameState.totalScore already includes gameState.score — see the
        // matching comment in the final-level branch of handleLevelWin above.
        const finalScore = gameState.totalScore;
        gameState.score = 0;

        // Save high score if it's a new record and clear saved progress
        const isNewBest = saveHighScore(finalScore);
        clearGameProgress();

        const gameOverModal = document.getElementById('gameOverModal');
        const gameOverFinalScore = document.getElementById('gameOverFinalScore');
        if (gameOverFinalScore) {
            gameOverFinalScore.textContent = `Total Score: ${formatScore(finalScore)}`;
        }
        toggleNewBest('gameOverNewBest', isNewBest);
        if (gameOverModal) {
            gameOverModal.classList.remove('hidden');
        }
        announce(isNewBest
            ? `Game over. New best score: ${formatScore(finalScore)}!`
            : `Game over. You've run out of lives. Total score: ${formatScore(finalScore)}.`);
        return;
    }

    // Toggle UI elements for restart
    if (restartContainer) {
        restartContainer.classList.remove('hidden');
    }
    if (restartBtn) {
        restartBtn.classList.remove('hidden');
    }
    if (nextLevelBtn) {
        nextLevelBtn.classList.add('hidden');
    }
    announce(`Level failed. You have ${gameState.lives} ${gameState.lives === 1 ? 'life' : 'lives'} remaining.`);
}
