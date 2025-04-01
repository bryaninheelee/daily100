// --- App.js ---
import React, { useState, useEffect } from "react";
import "./App.css";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";

const checklistItems = [
  "Slept > 8 hours",
  "Stretch",
  "Pray",
  "Gym",
  "Yoga",
  "Run",
  "Journal",
  "Read > 10 pages",
  "Call home",
  "Cook",
  "Clean",
  "Practice German",
  "Practice music",
  "Write content",
  "Create content",
  "Meditate",
  "Screen time < 4 hours",
];

const weights = [
  5, 5, 1, 5, 5, 5, 1, 10, 1, 1, 5, 20, 5, 10, 10, 1, 10
];

const getGrade = (score) => {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
};

const formatDate = (date) => date.toISOString().split("T")[0];

function App() {
  const [selectedView, setSelectedView] = useState("Today");
  const [date, setDate] = useState(formatDate(new Date()));
  const [checked, setChecked] = useState(Array(checklistItems.length).fill(false));
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const calculateScore = (checks) => {
    return checks.reduce((sum, isChecked, i) => sum + (isChecked ? weights[i] : 0), 0);
  };

  const handleCheck = (index) => {
    const newChecked = [...checked];
    newChecked[index] = !newChecked[index];
    setChecked(newChecked);
    setScore(calculateScore(newChecked));
  };

  const handleSubmit = async () => {
    const q = query(collection(db, "scores"), where("date", "==", date));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, { score, grade: getGrade(score) });
    } else {
      await addDoc(collection(db, "scores"), {
        date,
        score,
        grade: getGrade(score),
      });
    }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <div className="app">
      <h1>Daily100</h1>
      <div className="nav">
        {["Today", "Week", "Month"].map((view) => (
          <button
            key={view}
            className={selectedView === view ? "active" : ""}
            onClick={() => setSelectedView(view)}
          >
            {view}
          </button>
        ))}
      </div>
      <div>{date}</div>
      <ul>
        {checklistItems.map((item, i) => (
          <li key={i}>
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={() => handleCheck(i)}
            />
            {item}
          </li>
        ))}
      </ul>
      <div className="score">Score: {score}/100 ({getGrade(score)})</div>
      <button
        className={`submit-button ${submitted ? "submitted" : ""}`}
        onClick={handleSubmit}
      >
        {submitted ? "Submitted!" : "Submit"}
      </button>
    </div>
  );
}

export default App;
