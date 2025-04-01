
import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  setDoc,
  getDocs,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import "./App.css";

// Firebase config
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

// Tasks
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
  const [view, setView] = useState("today");

  const fetchHistory = async () => {
    const q = query(collection(db, "scores"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((docSnap) => {
      const docData = docSnap.data();
      return {
        ...docData,
        date: docData.date || docSnap.id,
      };
    });
    setHistory(data);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const total = checked.reduce((acc, i) => acc + TASKS[i].value, 0);
    setScore(total);
  }, [checked]);

  const toggleCheck = (i) => {
    setChecked((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  const submitScore = async () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const scoreRef = doc(db, "scores", todayStr);
    await setDoc(scoreRef, {
      score,
      grade: getGrade(score),
      date: todayStr,
    });
    alert("Score saved!");
    fetchHistory();
  };

  const getFilteredScores = () => {
    const now = new Date();
    return history.filter((entry) => {
      const entryDate = new Date(entry.date);
      if (view === "today") return entry.date === now.toISOString().split("T")[0];
      if (view === "week") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 6);
        return entryDate >= sevenDaysAgo && entryDate <= now;
      }
      if (view === "month")
        return (
          entryDate.getFullYear() === now.getFullYear() &&
          entryDate.getMonth() === now.getMonth()
        );
      return true;
    });
  };

  const filteredScores = getFilteredScores();
  const avg =
    filteredScores.reduce((acc, e) => acc + e.score, 0) /
    (filteredScores.length || 1);
  const avgGrade = getGrade(avg);

  return (
    <div className="p-4 max-w-xl mx-auto text-black">
      <h1 className="text-3xl font-bold mb-2">Daily100</h1>
      <div className="flex justify-between mb-4">
        {["today", "week", "month"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-full ${
              view === v ? "bg-black text-white" : "bg-gray-200 text-black"
            }`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
      <div className="text-md mb-4">
        Average ({view}): {avg.toFixed(1)}/100 ({avgGrade})
      </div>
      <div className="mb-6 space-y-2">
        {TASKS.map((task, index) => (
          <label key={index} className="flex items-center">
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
        className="bg-black text-white py-2 px-4 rounded-full mb-8"
      >
        Submit
      </button>
      <div className="mt-4">
        <h2 className="text-2xl font-bold mb-2">History</h2>
        <ul>
          {filteredScores.map((entry, idx) => (
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
