import React, { useState, useEffect } from "react";
import "./App.css";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
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

const getGrade = (score) => {
  if (score === 100) return "A+";
  if (score >= 95) return "A";
  if (score >= 90) return "A-";
  if (score >= 85) return "B+";
  if (score >= 80) return "B";
  if (score >= 75) return "B-";
  if (score >= 70) return "C+";
  if (score >= 65) return "C";
  if (score >= 60) return "C-";
  if (score >= 50) return "D";
  return "F";
};

function App() {
  const [checkedItems, setCheckedItems] = useState([]);
  const [view, setView] = useState("today");
  const [history, setHistory] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const handleCheckboxChange = (item) => {
    setCheckedItems((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  };

  const totalScore = Math.round((checkedItems.length / checklistItems.length) * 100);

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, "scores"), {
        date: today,
        score: totalScore,
        grade: getGrade(totalScore),
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error saving score:", error);
    }
  };

  const fetchScores = async () => {
    try {
      const q = query(collection(db, "scores"));
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map((doc) => doc.data());
      setHistory(results);
    } catch (error) {
      console.error("Error fetching scores:", error);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const todayData = history.find((entry) => entry.date === today);
  const monthData = history.filter(
    (entry) => entry.date && entry.date.slice(0, 7) === today.slice(0, 7)
  );
  const weekData = history.filter((entry) => {
    const entryDate = new Date(entry.date);
    const todayDate = new Date(today);
    const diff = (todayDate - entryDate) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff < 7;
  });

  const average = (data) => {
    if (data.length === 0) return 0;
    const total = data.reduce((sum, entry) => sum + (entry.score || 0), 0);
    return Math.round(total / data.length);
  };

  return (
    <div className="App">
      <h1>Daily100</h1>

      <div className="nav-buttons">
        <button onClick={() => setView("today")}>Today</button>
        <button onClick={() => setView("week")}>Week</button>
        <button onClick={() => setView("month")}>Month</button>
      </div>

      {view === "today" && (
        <>
          <p className="date-display">{today}</p>
          <div className="checklist">
            {checklistItems.map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={checkedItems.includes(item)}
                  onChange={() => handleCheckboxChange(item)}
                />
                {item}
              </label>
            ))}
          </div>
          <p>
            Score: {totalScore}/100 ({getGrade(totalScore)})
          </p>
          <button
            className={`submit-button ${isSubmitted ? "submitted" : ""}`}
            onClick={handleSubmit}
          >
            {isSubmitted ? "Submitted!" : "Submit"}
          </button>
        </>
      )}

      {view === "week" && (
        <div className="calendar-view">
          {weekData.map((entry) => (
            <div key={entry.date} className="calendar-cell">
              <p className="cell-date">{entry.date}</p>
              <p className="cell-score">{entry.score}/100</p>
              <p className="cell-grade">{entry.grade}</p>
            </div>
          ))}
          <p className="average-score">
            Weekly Average: {average(weekData)}/100 ({getGrade(average(weekData))})
          </p>
        </div>
      )}

      {view === "month" && (
        <div className="calendar-view">
          {monthData.map((entry) => (
            <div key={entry.date} className="calendar-cell">
              <p className="cell-date">{entry.date}</p>
              <p className="cell-score">{entry.score}/100</p>
              <p className="cell-grade">{entry.grade}</p>
            </div>
          ))}
          <p className="average-score">
            Monthly Average: {average(monthData)}/100 ({getGrade(average(monthData))})
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
