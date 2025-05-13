// online.js
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

import { db } from './firebase.js';

const playerName = `player${Math.floor(Math.random() * 9000 + 1000)}`;
let roomId = '';
let currentPlayerSymbol = ''; // 'X' hoặc 'O'

export async function createRoom(callback) {
  roomId = genRoomCode();
  const roomRef = doc(db, 'rooms_test', roomId);
  const board = Array(15)
    .fill(null)
    .map(() => Array(15).fill(''));

  await setDoc(roomRef, {
    board,
    turn: 'X',
    players: { X: playerName },
    status: 'waiting',
    createdAt: serverTimestamp(),
    winner: '',
    winCells: [],
  });

  currentPlayerSymbol = 'X';
  callback(roomId);
  listenToRoom(roomId);
}

export async function joinRoom(inputRoomId, callback) {
  roomId = inputRoomId.toUpperCase();
  const roomRef = doc(db, 'rooms_test', roomId);
  const rooms_testnap = await getDoc(roomRef);

  if (!rooms_testnap.exists()) {
    alert('Phòng không tồn tại');
    return;
  }

  const data = rooms_testnap.data();

  if (!data.players.O) {
    await updateDoc(roomRef, {
      'players.O': playerName,
      status: 'playing',
    });
    currentPlayerSymbol = 'O';
    callback(roomId);
    listenToRoom(roomId);
  } else {
    alert('Phòng đã đủ người');
  }
}

export async function sendMove(row, col, board, turn) {
  const roomRef = doc(db, 'rooms_test', roomId);
  board[row][col] = turn;

  await updateDoc(roomRef, {
    board,
    turn: turn === 'X' ? 'O' : 'X',
  });
}

export async function declareWinner(winner, winCells) {
  const roomRef = doc(db, 'rooms_test', roomId);
  await updateDoc(roomRef, {
    winner,
    winCells,
  });
}

export function listenToRoom(roomId) {
  const roomRef = doc(db, 'rooms_test', roomId);

  onSnapshot(roomRef, (docSnap) => {
    if (!docSnap.exists()) return;
    const data = docSnap.data();

    if (data.status === 'playing') {
      updateBoard(data.board);
      updateTurn(data.turn);
      updateWinner(data.winner, data.winCells);
    }
  });
}

function updateBoard(boardData) {
  const cells = document.querySelectorAll('.cell');
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      const index = r * 15 + c;
      const val = boardData[r][c];
      const cell = cells[index];
      if (cell && cell.textContent !== val) {
        cell.textContent = val;
        cell.className = 'cell ' + (val || '');
      }
    }
  }
}

function updateTurn(turn) {
  const isPlayerTurn = turn === currentPlayerSymbol;
  const status = document.getElementById('status');
  status.innerHTML = isPlayerTurn ? `👉 Lượt bạn (${turn})` : `⏳ Đối thủ (${turn})`;
}

function updateWinner(winner, winCells) {
  if (!winner) return;
  const status = document.getElementById('status');
  status.innerHTML = `${winner === 'X' ? '❌' : '⭕'} <strong>${winner} thắng!</strong>`;
  winCells.forEach(([r, c]) => {
    const index = r * 15 + c;
    document.querySelectorAll('.cell')[index].classList.add('win');
  });
}

function genRoomCode() {
  const chars = '0123456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

window.playerName = playerName;
