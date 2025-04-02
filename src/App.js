import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
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
  const [selectedDay, setSelectedDay] = useState(null);
  const [editChecked, setEditChecked] = useState([]);

  const today = new Date().toLocaleDateString("sv-SE");

  const calculateScore = (checked) => {
    return checked.reduce((total, isChecked, i) => isChecked ? total + checklistItems[i].weight : total, 0);
  };

  const handleCheckboxChange = (index) => {
    const newChecked = [...checked];
    newChecked[index] = !newChecked[index];
    const newScore = calculateScore(newChecked);
    setChecked(newChecked);
    setScore(newScore);
    setGrade(getGrade(newScore));
  };

  const handleSubmit = async () => {
    const newScore = calculateScore(checked);
    const grade = getGrade(newScore);
    await setDoc(doc(db, "scores", today), {
      date: today,
      score: newScore,
      grade,
      checked // save the checklist state for today
    });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
    loadScores();
  };

  const loadScores = async () => {
    const snapshot = await getDocs(collection(db, "scores"));
    const docs = snapshot.docs.map((doc) => doc.data());
    const filtered = Object.values(
      docs.reduce((acc, curr) => {
        acc[curr.date] = curr;
        return acc;
      }, {})
    );
    setData(filtered);

    const todayEntry = filtered.find((item) => item.date === today);
    if (todayEntry && todayEntry.checked) {
      setChecked(todayEntry.checked);
      setScore(todayEntry.score);
      setGrade(todayEntry.grade);
    }
  };

  const handleEditDay = (date) => {
    const entry = data.find((item) => item.date === date);
    if (entry && entry.checked) {
      setEditChecked(entry.checked);
    } else {
      const estimatedChecked = checklistItems.map((item) => {
        return entry && entry.score >= item.weight ? true : false;
      });
      setEditChecked(estimatedChecked);
    }
    setSelectedDay(date);
  };

  const handleEditChange = (index) => {
    const newChecked = [...editChecked];
    newChecked[index] = !newChecked[index];
    setEditChecked(newChecked);
  };

  const handleEditSave = async () => {
    const updatedScore = calculateScore(editChecked);
    const updatedGrade = getGrade(updatedScore);
    await setDoc(doc(db, "scores", selectedDay), {
      date: selectedDay,
      score: updatedScore,
      grade: updatedGrade,
      checked: editChecked,
    });
    setSelectedDay(null);
    loadScores();
  };

  useEffect(() => {
    loadScores();
  }, []);

  const renderScores = () => {
    const now = new Date();
    let filtered = data;

    if (view === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      filtered = data.filter((item) => new Date(item.date) >= weekAgo);
    } else if (view === "month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      filtered = data.filter((item) => new Date(item.date) >= monthAgo);
    } else {
      return null;
    }

    const average =
      filtered.reduce((sum, entry) => sum + entry.score, 0) / filtered.length || 0;
    const averageGrade = getGrade(Math.round(average));

    return (
      <div className="mt-4 space-y-1">
        {filtered.map((entry, i) => (
          <div key={i}>{entry.date} - {entry.score} ({entry.grade})</div>
        ))}
        <div className="font-semibold mt-2">Average: {Math.round(average)} ({averageGrade})</div>
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
            onClick={() => setView(v)}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {view === "today" && (
        <>
          <div className="mb-2 text-sm">{today}</div>
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
      )}

      {view !== "today" && (
        <>
          {renderScores()}
          <CalendarView data={data} month={new Date()} onDayClick={handleEditDay} />
        </>
      )}

      {selectedDay && (
        <div className="mt-6 p-4 border rounded bg-white">
          <h2 className="font-bold mb-2">Edit {selectedDay}</h2>
          <div className="space-y-2">
            {checklistItems.map((item, i) => (
              <label key={i} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editChecked[i] || false}
                  onChange={() => handleEditChange(i)}
                />
                {item.label}
              </label>
            ))}
          </div>
          <button
            onClick={handleEditSave}
            className="mt-3 px-4 py-1 bg-black text-white rounded"
          >
            Save
          </button>
          <button
            onClick={() => setSelectedDay(null)}
            className="ml-2 text-sm text-gray-600 underline"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
