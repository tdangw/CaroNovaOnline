// firebase.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDAQDT9dqRgpEF2iWxY9LsZF_eRJ14DUfU',
  authDomain: 'caronovaonline.firebaseapp.com',
  projectId: 'caronovaonline',
  storageBucket: 'caronovaonline.firebasestorage.app',
  messagingSenderId: '565695054679',
  appId: '1:565695054679:web:7cbb1c4164a9842801f412',
  measurementId: 'G-C1VYCBES94',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { doc, setDoc, getDoc, updateDoc, onSnapshot, serverTimestamp };
