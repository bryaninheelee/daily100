import React, { useEffect, useState } from "react";
import "./App.css";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyC966X_9sp3JP64U_VPkCY-7Km7Oh6MB9I",
  authDomain: "daily100-ce649.firebaseapp.com",
  projectId: "daily100-ce649",
  storageBucket: "daily100-ce649.appspot.com",
  messagingSenderId: "513528993358",
  appId: "1:513528993358:web:e27a209b56f45d347a151f",
  measurementId: "G-DG94LKCL6E",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const tasks = [
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

function getGrade(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export default function App() {
  const [view, setView] = useState("Today");
  const [checked, setChecked] = useState({});
  const [score, setScore] = useState(0);
  const [today, setToday] = useState(new Date());
  const [entries, setEntries] = useState([]);

  const dateString = today.toISOString().split("T")[0];

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, "scores"));
      const snapshot = await getDocs(q);
      const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEntries(all);
    };
    fetchData();
  }, [score]);

  useEffect(() => {
    let newScore = 0;
    tasks.forEach((task) => {
      if (checked[task.label]) newScore += task.weight;
    });
    setScore(newScore);
  }, [checked]);

  const handleCheck = (task) => {
    setChecked((prev) => ({ ...prev, [task.label]: !prev[task.label] }));
  };

 import { setDoc, doc } from "firebase/firestore"; // update this import

const handleSubmit = async () => {
  const docRef = doc(db, "scores", dateString);
  await setDoc(docRef, {
    date: dateString,
    score,
    grade: getGrade(score),
  });
};

  const renderToday = () => (
    <>
      <div className="date">{dateString}</div>
      <div className="checklist">
        {tasks.map((task) => (
          <label key={task.label}>
            <input
              type="checkbox"
              checked={checked[task.label] || false}
              onChange={() => handleCheck(task)}
            />
            {task.label}
          </label>
        ))}
      </div>
      <div className="score">
        Score: {score}/100 ({getGrade(score)})
      </div>
      <button onClick={handleSubmit}>Submit</button>
    </>
  );

  const renderMonth = () => {
    const currentMonth = today.getMonth();
    const filtered = entries.filter(
      (e) => new Date(e.date).getMonth() === currentMonth
    );
    return (
      <div className="calendar-grid">
        {filtered.map((entry) => (
          <div key={entry.date} className="calendar-day">
            <div>{entry.date.slice(5)}</div>
            <div>{entry.score}</div>
            <div>{entry.grade}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderWeek = () => {
    const todayTime = today.getTime();
    const last7Days = entries.filter((entry) => {
      const entryTime = new Date(entry.date).getTime();
      return todayTime - entryTime <= 7 * 24 * 60 * 60 * 1000;
    });

    const avgScore =
      last7Days.reduce((sum, e) => sum + (e.score || 0), 0) / last7Days.length || 0;

    return (
      <>
        <div className="score">
          Weekly Avg: {Math.round(avgScore)}/100 ({getGrade(avgScore)})
        </div>
        <div className="calendar-grid">
          {last7Days.map((entry) => (
            <div key={entry.date} className="calendar-day">
              <div>{entry.date.slice(5)}</div>
              <div>{entry.score}</div>
              <div>{entry.grade}</div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="App">
      <h1>Daily100</h1>
      <div className="nav">
        <button onClick={() => setView("Today")}>Today</button>
        <button onClick={() => setView("Week")}>Week</button>
        <button onClick={() => setView("Month")}>Month</button>
      </div>
      {view === "Today" && renderToday()}
      {view === "Week" && renderWeek()}
      {view === "Month" && renderMonth()}
    </div>
  );
}
