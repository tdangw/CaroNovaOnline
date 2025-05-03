// game-pve.js
import { getAIMove } from './ai.js';

export function createBoardPVE(context) {
  const { boardElement, statusElement, timerElement, turnProgress, boardSize, updateScoreboard, saveScoreboard } =
    context;

  const board = [];
  let currentPlayer = 'X';
  let gameOver = false;
  let playerScore = 0,
    aiScore = 0,
    playerWins = 0,
    aiWins = 0,
    drawCount = 0;
  let totalTime = 3000,
    turnTime = 300,
    totalTimerId = null,
    turnTimerId = null;

  function createBoard() {
    boardElement.innerHTML = '';
    board.length = 0;

    for (let row = 0; row < boardSize; row++) {
      board[row] = [];
      for (let col = 0; col < boardSize; col++) {
        board[row][col] = '';
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.addEventListener('click', handleCellClick);
        boardElement.appendChild(cell);
      }
    }

    currentPlayer = 'X';
    gameOver = false;
    updateTurnLabel(true);
    updateTotalTimer();
    resetTimers();
  }

  function handleCellClick(e) {
    if (gameOver) return;
    const row = +e.target.dataset.row;
    const col = +e.target.dataset.col;
    if (board[row][col] !== '') return;

    makeMove(row, col, currentPlayer);
    if (checkWin(row, col, currentPlayer)) {
      endGame('🎉 Người chơi thắng!', 'player');
      return;
    }

    currentPlayer = 'O';
    updateTurnLabel(false);
    runAI();
  }

  function runAI() {
    const delay = Math.floor(Math.random() * 300) + 600;
    resetTimers();
    setTimeout(() => {
      if (!gameOver && currentPlayer === 'O') {
        const [r, c] = getAIMove(board);
        makeMove(r, c, 'O');
        const index = r * boardSize + c;
        const cells = boardElement.querySelectorAll('.cell');
        cells[index].classList.add('ai-move');

        setTimeout(() => {
          if (!cells[index].classList.contains('win')) {
            cells[index].classList.remove('ai-move');
          }
        }, 500);

        if (checkWin(r, c, 'O')) {
          endGame('⭕ Máy thắng!', 'ai');
        } else {
          currentPlayer = 'X';
          updateTurnLabel(true);
          resetTimers();
        }
      }
    }, delay);
  }

  function makeMove(row, col, player) {
    board[row][col] = player;
    const index = row * boardSize + col;
    const cells = boardElement.querySelectorAll('.cell');
    cells[index].textContent = player;
    cells[index].classList.add(player);
  }

  function checkWin(row, col, player) {
    const dirs = [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, -1],
    ];
    for (const [dr, dc] of dirs) {
      let count = 1;
      let r = row + dr,
        c = col + dc;
      while (inBounds(r, c) && board[r][c] === player) {
        count++;
        r += dr;
        c += dc;
      }
      r = row - dr;
      c = col - dc;
      while (inBounds(r, c) && board[r][c] === player) {
        count++;
        r -= dr;
        c -= dc;
      }
      if (count >= 5) return true;
    }
    return false;
  }

  function endGame(message, winner) {
    gameOver = true;
    statusElement.textContent = message;
    clearInterval(totalTimerId);
    clearInterval(turnTimerId);
    if (winner === 'player') {
      playerScore += 100;
      playerWins++;
    } else if (winner === 'ai') {
      aiScore += 100;
      aiWins++;
    } else {
      playerScore += 50;
      aiScore += 50;
      drawCount++;
    }
    updateScoreboard({ playerScore, aiScore, playerWins, aiWins, drawCount });
    saveScoreboard({ playerScore, aiScore, playerWins, aiWins, drawCount });
  }

  function updateTurnLabel(isPlayer) {
    statusElement.textContent = `Lượt: ${isPlayer ? '❌ Người chơi' : '⭕ Máy'}`;
  }

  function resetTimers() {
    clearInterval(turnTimerId);
    clearInterval(totalTimerId);
    let remaining = turnTime;
    turnProgress.style.width = '100%';
    turnTimerId = setInterval(() => {
      remaining--;
      turnProgress.style.width = `${(remaining / turnTime) * 100}%`;
      if (remaining <= 0) {
        clearInterval(turnTimerId);
        endGame('⏱️ Hết giờ!', currentPlayer === 'X' ? 'ai' : 'player');
      }
    }, 1000);

    totalTimerId = setInterval(() => {
      totalTime--;
      updateTotalTimer();
      if (totalTime <= 0) {
        clearInterval(totalTimerId);
        endGame('⏱️ Hết giờ toàn trận!', 'draw');
      }
    }, 1000);
  }

  function updateTotalTimer() {
    const m = String(Math.floor(totalTime / 60)).padStart(2, '0');
    const s = String(totalTime % 60).padStart(2, '0');
    timerElement.textContent = `⏱️ ${m}:${s}`;
  }

  function inBounds(r, c) {
    return r >= 0 && r < boardSize && c >= 0 && c < boardSize;
  }

  createBoard();
}
