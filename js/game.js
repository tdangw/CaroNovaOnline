// game.js
import { createBoardPVE } from './game-pve.js';
import { createBoardPVP } from './game-pvp.js';

const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const timerElement = document.getElementById('timer');
const turnProgress = document.getElementById('turn-progress-bar');
const modeSelect = document.getElementById('mode-select');

const boardSize = 15;

function updateScoreboard(data) {
  document.getElementById('player-score').textContent = data.playerScore;
  document.getElementById('ai-score').textContent = data.aiScore;
  document.getElementById('player-wins').textContent = data.playerWins;
  document.getElementById('ai-wins').textContent = data.aiWins;
  document.getElementById('draw-count').textContent = data.drawCount;
}

function saveScoreboard(data) {
  localStorage.setItem('caro-scoreboard', JSON.stringify(data));
}

function loadScoreboard() {
  const saved = JSON.parse(localStorage.getItem('caro-scoreboard'));
  if (saved) updateScoreboard(saved);
}

modeSelect.addEventListener('change', () => {
  const mode = modeSelect.value;
  const context = {
    boardElement,
    statusElement,
    timerElement,
    turnProgress,
    boardSize,
    updateScoreboard,
    saveScoreboard,
  };

  if (mode === 'pve') createBoardPVE(context);
  else if (mode === 'pvp') createBoardPVP(context);
  else if (mode === 'online') {
    import('./game-online.js').then((mod) => mod.initOnlineGame());
  }
  // Nếu bạn muốn thêm chế độ chơi khác, bạn có thể thêm vào đây
  // sẽ thêm: else if (mode === 'online') initOnlineGame(context);
});

document.getElementById('reset-btn').addEventListener('click', () => {
  modeSelect.dispatchEvent(new Event('change'));
});

document.getElementById('reset-stats-btn')?.addEventListener('click', () => {
  localStorage.removeItem('caro-scoreboard');
  loadScoreboard();
});

loadScoreboard();
modeSelect.dispatchEvent(new Event('change'));
