// Daily100 - MVP Web App
// Tech stack: React + Tailwind CSS + Firebase (FireStore)

import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import "./App.css";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const TASKS = [
  { name: "Slept > 8 hours", value: 5 },
  { name: "Stretch", value: 5 },
  { name: "Pray", value: 1 },
  { name: "Gym", value: 5 },
  { name: "Yoga", value: 5 },
  { name: "Run", value: 5 },
  { name: "Journal", value: 1 },
  { name: "Read > 10 pages", value: 10 },
  { name: "Call home", value: 1 },
  { name: "Cook", value: 1 },
  { name: "Clean", value: 5 },
  { name: "Practice German", value: 20 },
  { name: "Practice music", value: 5 },
  { name: "Write content", value: 10 },
  { name: "Create content", value: 10 },
  { name: "Meditate", value: 1 },
  { name: "Screen time < 4 hours", value: 10 },
];

function getGrade(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function App() {
  const [checked, setChecked] = useState([]);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const total = checked.reduce((acc, index) => acc + TASKS[index].value, 0);
    setScore(total);
  }, [checked]);

  useEffect(() => {
    const fetchHistory = async () => {
      const q = query(collection(db, "scores"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      setHistory(querySnapshot.docs.map((doc) => doc.data()));
    };
    fetchHistory();
  }, []);

  const toggleCheck = (index) => {
    setChecked((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const submitScore = async () => {
    const today = new Date().toISOString().split("T")[0];
    await addDoc(collection(db, "scores"), {
      date: today,
      score,
      grade: getGrade(score),
    });
    alert("Score submitted!");
  };

  return (
    <div className="min-h-screen bg-white p-4 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Daily100</h1>
      <div className="mb-6">
        {TASKS.map((task, index) => (
          <label
            key={index}
            className="flex items-center py-2 border-b border-gray-200"
          >
            <input
              type="checkbox"
              className="mr-3 h-5 w-5"
              checked={checked.includes(index)}
              onChange={() => toggleCheck(index)}
            />
            <span className="text-lg">{task.name}</span>
          </label>
        ))}
      </div>

      <div className="text-xl font-semibold mb-2">
        Score: {score}/100 ({getGrade(score)})
      </div>

      <button
        onClick={submitScore}
        className="bg-black text-white py-2 px-4 rounded-full"
      >
        Submit
      </button>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-2">History</h2>
        <ul>
          {history.map((entry, idx) => (
            <li key={idx} className="py-1 border-b">
              {entry.date}: {entry.score} ({entry.grade})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
