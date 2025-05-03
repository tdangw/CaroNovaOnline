// game-pvp.js
export function createBoardPVP(context) {
  const { boardElement, statusElement, boardSize } = context;

  const board = [];
  let currentPlayer = 'X';
  let gameOver = false;

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
  }

  function handleCellClick(e) {
    if (gameOver) return;
    const row = +e.target.dataset.row;
    const col = +e.target.dataset.col;
    if (board[row][col] !== '') return;

    makeMove(row, col, currentPlayer);
    if (checkWin(row, col, currentPlayer)) {
      endGame(`🎉 ${currentPlayer === 'X' ? 'Người 1' : 'Người 2'} thắng!`);
      return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurnLabel(currentPlayer === 'X');
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

  function endGame(msg) {
    gameOver = true;
    statusElement.textContent = msg;
  }

  function updateTurnLabel(isPlayer1) {
    statusElement.textContent = `Lượt: ${isPlayer1 ? '❌ Người 1' : '⭕ Người 2'}`;
  }

  function inBounds(r, c) {
    return r >= 0 && r < boardSize && c >= 0 && c < boardSize;
  }

  createBoard();
}
