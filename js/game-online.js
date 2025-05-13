// game-online.js
import { db, doc, setDoc, getDoc, updateDoc, onSnapshot, serverTimestamp } from './firebase.js';
const roomLabel = document.getElementById('room-code-label');

let board = {}; // object thay vì mảng
let gameOver = false;
let currentPlayer = 'X';
let playerSymbol = 'X';
let roomId = '';
const boardSize = 15;

const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');

export function initOnlineGame() {
  board = {}; // reset board dạng object
  gameOver = false;
  currentPlayer = 'X';

  roomId = prompt('Nhập mã phòng (4 ký tự) hoặc để trống để tạo:');
  if (!roomId || roomId.trim() === '') {
    roomId = generateRoomCode();
    playerSymbol = 'X';
    createRoom(roomId);
  } else {
    roomId = roomId.trim().toUpperCase(); // viết hoa mã phòng
    playerSymbol = 'O';
    joinRoom(roomId);
  }

  // ✅ Hiển thị mã phòng lên UI
  roomLabel.textContent = `📡 Mã phòng: ${roomId}`;
  roomLabel.classList.remove('hidden');

  statusElement.textContent = `🔗 Phòng: ${roomId} | Bạn là: ${playerSymbol}`;
  createBoardUI();
}

function createRoom(id) {
  const ref = doc(db, 'rooms_test', id);
  const boardObj = {};
  for (let r = 0; r < boardSize; r++) {
    boardObj[r] = {};
    for (let c = 0; c < boardSize; c++) {
      boardObj[r][c] = '';
    }
  }
  board = boardObj;

  setDoc(ref, {
    board: boardObj,
    turn: 'X',
    createdAt: serverTimestamp(),
  });

  listenToRoom(id);
}

function joinRoom(id) {
  const ref = doc(db, 'rooms_test', id);
  getDoc(ref).then((snapshot) => {
    if (!snapshot.exists()) {
      alert('❌ Phòng không tồn tại!');
      return;
    }
    board = snapshot.data().board || {};
    listenToRoom(id);
  });
}

function createBoardUI() {
  boardElement.innerHTML = '';
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('click', handleCellClick);
      boardElement.appendChild(cell);
    }
  }
}

function handleCellClick(e) {
  if (gameOver) return;
  const row = e.target.dataset.row;
  const col = e.target.dataset.col;
  if (board[row][col] !== '') return;
  if (currentPlayer !== playerSymbol) return;

  board[row][col] = playerSymbol;
  updateBoardUI(row, col, playerSymbol);
  updateRoomMove(row, col);
}

function updateRoomMove(row, col) {
  const ref = doc(db, 'rooms_test', roomId);
  updateDoc(ref, {
    [`board.${row}.${col}`]: playerSymbol,
    turn: playerSymbol === 'X' ? 'O' : 'X',
  });
}

function updateBoardUI(row, col, symbol) {
  const index = row * boardSize + +col;
  const cells = boardElement.querySelectorAll('.cell');
  cells[index].textContent = symbol;
  cells[index].className = 'cell';
  if (symbol) cells[index].classList.add(symbol);
}

function listenToRoom(id) {
  const ref = doc(db, 'rooms_test', id);
  onSnapshot(ref, (docSnap) => {
    const data = docSnap.data();
    if (!data) return;

    board = data.board;
    currentPlayer = data.turn;

    const cells = boardElement.querySelectorAll('.cell');
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        const symbol = board?.[r]?.[c] || '';
        const index = r * boardSize + c;
        cells[index].textContent = symbol;
        cells[index].className = 'cell';
        if (symbol) cells[index].classList.add(symbol);
      }
    }

    const winner = checkWinner();
    if (winner && !gameOver) {
      gameOver = true;
      statusElement.textContent = `🎉 ${winner === playerSymbol ? 'Bạn thắng!' : 'Đối thủ thắng!'}`;
    } else {
      statusElement.textContent = `Lượt: ${currentPlayer === 'X' ? '❌' : '⭕'} (${
        currentPlayer === playerSymbol ? 'Bạn' : 'Đối thủ'
      })`;
    }
  });
}

function checkWinner() {
  const dirs = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const player = board?.[r]?.[c];
      if (!player) continue;
      for (const [dr, dc] of dirs) {
        let count = 1;
        let rr = r + dr,
          cc = c + dc;
        while (count < 5 && inBounds(rr, cc) && board?.[rr]?.[cc] === player) {
          count++;
          rr += dr;
          cc += dc;
        }
        rr = r - dr;
        cc = c - dc;
        while (count < 5 && inBounds(rr, cc) && board?.[rr]?.[cc] === player) {
          count++;
          rr -= dr;
          cc -= dc;
        }
        if (count >= 5) return player;
      }
    }
  }
  return null;
}

function inBounds(r, c) {
  return r >= 0 && r < boardSize && c >= 0 && c < boardSize;
}

function generateRoomCode() {
  const chars = '0123456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
