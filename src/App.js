import React, { useState, useEffect } from "react";
import "./App.css";
import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const checklistItems = [
  { label: "Slept > 8 hours", weight: 5 },
  { label: "Stretch", weight: 5 },
  { label: "Pray", weight: 1 },
  { label: "Gym", weight: 5 },
  { label: "Yoga", weight: 5 },
  { label: "Run", weight: 5 },
  { label: "Journal", weight: 1 },
  { label: "Read > 10 pages", weight: 10 },
  { label: "Call home", weight: 1 },
  { label: "Cook", weight: 1 },
  { label: "Clean", weight: 5 },
  { label: "Practice German", weight: 20 },
  { label: "Practice music", weight: 5 },
  { label: "Write content", weight: 10 },
  { label: "Create content", weight: 10 },
  { label: "Meditate", weight: 1 },
  { label: "Screen time < 4 hours", weight: 10 },
];

const getGrade = (score) => {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
};

function App() {
  const [view, setView] = useState("today");
  const [checkedItems, setCheckedItems] = useState(
    Array(checklistItems.length).fill(false)
  );
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, "scores"), where("date", "==", today));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => doc.data());
      setHistory(data);
    };
    fetchData();
  }, [view]);

  const handleSubmit = async () => {
    const score = checkedItems.reduce(
      (total, checked, index) =>
        total + (checked ? checklistItems[index].weight : 0),
      0
    );

    const grade = getGrade(score);
    const docRef = doc(db, "scores", today);
    await setDoc(docRef, { date: today, score, grade });
    setSubmissionStatus("submitted");
  };

  const totalScore = checkedItems.reduce(
    (total, checked, index) =>
      total + (checked ? checklistItems[index].weight : 0),
    0
  );
  const grade = getGrade(totalScore);

  return (
    <div className="app-container">
      <h1>Daily100</h1>
      <div className="nav">
        <button
          className={view === "today" ? "active" : ""}
          onClick={() => setView("today")}
        >
          Today
        </button>
        <button
          className={view === "week" ? "active" : ""}
          onClick={() => setView("week")}
        >
          Week
        </button>
        <button
          className={view === "month" ? "active" : ""}
          onClick={() => setView("month")}
        >
          Month
        </button>
      </div>
      <p>{today}</p>
      <div className="checklist">
        {checklistItems.map((item, index) => (
          <div key={index}>
            <input
              type="checkbox"
              checked={checkedItems[index]}
              onChange={() => {
                const newItems = [...checkedItems];
                newItems[index] = !newItems[index];
                setCheckedItems(newItems);
              }}
            />
            <label>{item.label}</label>
          </div>
        ))}
      </div>
      <p>Score: {totalScore}/100 ({grade})</p>
      <button
        onClick={handleSubmit}
        className={submissionStatus === "submitted" ? "submitted" : ""}
      >
        {submissionStatus === "submitted" ? "Submitted!" : "Submit"}
      </button>
    </div>
  );
}

export default App;
