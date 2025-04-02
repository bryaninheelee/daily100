import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  setDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import CalendarView from "./CalendarView";
import "./App.css";

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
  const [checked, setChecked] = useState(Array(checklistItems.length).fill(false));
  const [score, setScore] = useState(0);
  const [grade, setGrade] = useState("F");
  const [view, setView] = useState("today");
  const [data, setData] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const today = new Date().toISOString().split("T")[0];
  const activeDate = selectedDate || today;

  const calculateScore = (checked) => {
    let total = 0;
    checked.forEach((isChecked, i) => {
      if (isChecked) total += checklistItems[i].weight;
    });
    return total;
  };

  const handleCheckboxChange = (index) => {
    const newChecked = [...checked];
    newChecked[index] = !newChecked[index];
    setChecked(newChecked);
    const newScore = calculateScore(newChecked);
    setScore(newScore);
    setGrade(getGrade(newScore));
  };

  const handleSubmit = async () => {
    const newScore = calculateScore(checked);
    const grade = getGrade(newScore);

    await setDoc(doc(collection(db, "scores"), activeDate), {
      date: activeDate,
      score: newScore,
      grade,
      checklist: checked,
    });

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
    await loadScores();
  };

  const loadScores = async () => {
    const snapshot = await getDocs(collection(db, "scores"));
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setData(docs);

    const current = docs.find((d) => d.date === activeDate);
    if (current) {
      setChecked(current.checklist || Array(checklistItems.length).fill(false));
      setScore(current.score);
      setGrade(current.grade);
    } else {
      setChecked(Array(checklistItems.length).fill(false));
      setScore(0);
      setGrade("F");
    }
  };

  useEffect(() => {
    loadScores();
  }, [activeDate]);

  const filteredData = () => {
    const now = new Date();
    if (view === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return data.filter((item) => new Date(item.date) >= weekAgo);
    }
    if (view === "month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      return data.filter((item) => new Date(item.date) >= monthAgo);
    }
    return [];
  };

  const renderToday = () => (
    <>
      <div className="mb-2 text-sm">{activeDate}</div>
      <div className="space-y-2">
        {checklistItems.map((item, i) => (
          <label key={i} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={() => handleCheckboxChange(i)}
            />
            {item.label}
          </label>
        ))}
      </div>
      <div className="mt-4 font-semibold">
        Score: {score}/100 ({grade})
      </div>
      <button
        onClick={handleSubmit}
        className={`mt-2 px-4 py-1 rounded text-white ${submitted ? "bg-green-600" : "bg-black"}`}
      >
        {submitted ? "Submitted!" : "Submit"}
      </button>
    </>
  );

  const renderAverages = () => {
    const filtered = filteredData();
    const average = filtered.reduce((sum, e) => sum + e.score, 0) / (filtered.length || 1);
    const averageGrade = getGrade(Math.round(average));

    return (
      <div className="mb-4 font-semibold">
        Average: {Math.round(average)} ({averageGrade})
      </div>
    );
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Daily100</h1>
      <div className="flex gap-2 mb-4">
        {["today", "week", "month"].map((v) => (
          <button
            key={v}
            className={`px-3 py-1 rounded text-white ${view === v ? "bg-black" : "bg-gray-600"}`}
            onClick={() => {
              setView(v);
              setSelectedDate(null);
            }}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {view === "today" && renderToday()}
      {["week", "month"].includes(view) && (
        <>
          {selectedDate ? renderToday() : renderAverages()}
          <CalendarView
            data={data}
            view={view}
            selectedDate={selectedDate}
            onSelectDate={(date) => setSelectedDate(date)}
          />
        </>
      )}
    </div>
  );
}

export default App;
