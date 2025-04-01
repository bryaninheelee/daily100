// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC966X_9sp3JP64U_VPkCY-7Km7Oh6MB9I",
  authDomain: "daily100-ce649.firebaseapp.com",
  projectId: "daily100-ce649",
  storageBucket: "daily100-ce649.appspot.com",
  messagingSenderId: "513528993358",
  appId: "1:513528993358:web:e27a209b56f45d347a151f",
  measurementId: "G-DG94LKCL6E"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
