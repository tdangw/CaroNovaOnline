export function createBoard(size, board) {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  for (let r = 0; r < size; r++) {
    board[r] = [];
    for (let c = 0; c < size; c++) {
      board[r][c] = '';
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.onclick = handleCellClick;
      boardEl.appendChild(cell);
    }
  }
}

function handleCellClick(e) {
  const row = +e.target.dataset.row;
  const col = +e.target.dataset.col;
  const board = window.board;
  if (!window.gameStarted || window.currentPlayer !== window.playerSymbol) return;
  if (board[row][col] !== '') return;
  board[row][col] = window.playerSymbol;
  e.target.textContent = window.playerSymbol;
  e.target.classList.add(window.playerSymbol);
  const winCells = checkWin(row, col, window.playerSymbol, board);
  if (winCells) {
    highlightCells(winCells);
    endGame('🎉 Bạn thắng!');
    updateRoom(board, window.playerSymbol, 'ended');
    return;
  }
  window.currentPlayer = window.currentPlayer === 'X' ? 'O' : 'X';
  updateRoom(board, window.currentPlayer, 'playing');
}

export function highlightCells(cells) {
  cells.forEach(([r, c]) => {
    const idx = r * 15 + c;
    document.getElementById('board').children[idx].classList.add('win');
  });
}

export function updateBoardUI(flatBoard, board, size) {
  const boardEl = document.getElementById('board');
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const key = `${r}_${c}`;
      const val = flatBoard[key];
      board[r][c] = val;
      const idx = r * size + c;
      const cell = boardEl.children[idx];
      if (val && !cell.textContent) {
        cell.textContent = val;
        cell.classList.add(val);
      }
    }
  }
  return board;
}

export function updatePlayerNames(p1, p2) {
  document.getElementById('player1-name').textContent = p1 || '';
  document.getElementById('player2-name').textContent = p2 || '';
}

export function endGame(msg) {
  window.gameStarted = false;
  document.getElementById('status').textContent = msg;
}

async function updateRoom(board, turn, status) {
  const flatBoard = {};
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      flatBoard[`${r}_${c}`] = board[r][c];
    }
  }
  const { db, doc, updateDoc } = await import('./firebase.js');
  await updateDoc(doc(db, 'rooms', window.onlineRoomId), {
    board: flatBoard,
    turn,
    status,
  });
}

function checkWin(row, col, player, board) {
  const directions = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];
  for (let [dr, dc] of directions) {
    let count = 1,
      cells = [[row, col]];
    let r = row + dr,
      c = col + dc;
    while (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c] === player) {
      cells.push([r, c]);
      r += dr;
      c += dc;
      count++;
    }
    r = row - dr;
    c = col - dc;
    while (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c] === player) {
      cells.unshift([r, c]);
      r -= dr;
      c -= dc;
      count++;
    }
    if (count >= 5) return cells;
  }
  return null;
}
