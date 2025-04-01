// App.js
import React, { useEffect, useState } from "react";
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
import { format, startOfWeek, addDays, startOfMonth, eachDayOfInterval } from "date-fns";

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
  const [checked, setChecked] = useState(Array(checklistItems.length).fill(false));
  const [score, setScore] = useState(0);
  const [grade, setGrade] = useState("F");
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [history, setHistory] = useState([]);

  const calculateScore = (checks) => {
    const rawScore = checks.reduce(
      (sum, checked, idx) => sum + (checked ? checklistItems[idx].weight : 0),
      0
    );
    return rawScore;
  };

  const handleSubmit = async () => {
    const newScore = calculateScore(checked);
    const newGrade = getGrade(newScore);
    setSubmitting(true);
    await setDoc(doc(collection(db, "scores"), date), {
      date,
      score: newScore,
      grade: newGrade,
    });
    setScore(newScore);
    setGrade(newGrade);
    setTimeout(() => setSubmitting(false), 1000);
  };

  const fetchHistory = async () => {
    const snapshot = await getDocs(collection(db, "scores"));
    const data = snapshot.docs.map(doc => doc.data());
    setHistory(data);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const renderChecklist = () => (
    <div className="checklist">
      {checklistItems.map((item, idx) => (
        <label key={idx}>
          <input
            type="checkbox"
            checked={checked[idx]}
            onChange={() => {
              const newChecked = [...checked];
              newChecked[idx] = !newChecked[idx];
              setChecked(newChecked);
              const newScore = calculateScore(newChecked);
              setScore(newScore);
              setGrade(getGrade(newScore));
            }}
          />
          {item.label}
        </label>
      ))}
    </div>
  );

  const renderCalendar = (days) => (
    <div className="calendar">
      {days.map((day, idx) => {
        const entry = history.find(h => h.date === format(day, "yyyy-MM-dd"));
        return (
          <div key={idx} className="day">
            <div>{format(day, "dd/MM")}</div>
            <div className="score-box">{entry ? `${entry.score}/100 (${entry.grade})` : "-"}</div>
          </div>
        );
      })}
    </div>
  );

  const renderView = () => {
    const today = new Date();
    if (view === "today") return renderChecklist();
    if (view === "week") {
      const start = startOfWeek(today, { weekStartsOn: 1 });
      const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
      return renderCalendar(days);
    }
    if (view === "month") {
      const start = startOfMonth(today);
      const days = eachDayOfInterval({ start, end: new Date() });
      return renderCalendar(days);
    }
  };

  return (
    <div className="app">
      <h1>Daily100</h1>
      <div className="nav">
        {['today', 'week', 'month'].map(mode => (
          <button
            key={mode}
            className={view === mode ? "active" : ""}
            onClick={() => setView(mode)}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      <p>{date}</p>
      {renderView()}

      {view === "today" && (
        <>
          <p>
            Score: {score}/100 ({grade})
          </p>
          <button
            className={submitting ? "submitted" : "submit"}
            onClick={handleSubmit}
          >
            {submitting ? "Submitted!" : "Submit"}
          </button>
        </>
      )}
    </div>
  );
}

export default App;
