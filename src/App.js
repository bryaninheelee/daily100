import React, { useState, useEffect } from "react";
import "./App.css";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, doc } from "firebase/firestore";

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

const tasks = [
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

function App() {
  const [checked, setChecked] = useState({});
  const [score, setScore] = useState(0);
  const [grade, setGrade] = useState("F");
  const [history, setHistory] = useState({});
  const [view, setView] = useState("today");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const total = tasks.reduce((sum, task) => {
      return sum + (checked[task.name] ? task.value : 0);
    }, 0);
    setScore(total);
    if (total >= 90) setGrade("A");
    else if (total >= 80) setGrade("B");
    else if (total >= 70) setGrade("C");
    else if (total >= 60) setGrade("D");
    else setGrade("F");
  }, [checked]);

  useEffect(() => {
    const fetchHistory = async () => {
      const querySnapshot = await getDocs(collection(db, "scores"));
      let data = {};
      querySnapshot.forEach((doc) => {
        data[doc.id] = doc.data();
      });
      setHistory(data);
    };
    fetchHistory();
  }, []);

  const handleCheck = (taskName) => {
    setChecked({ ...checked, [taskName]: !checked[taskName] });
  };

  const handleSubmit = async () => {
    await setDoc(doc(db, "scores", today), {
      date: today,
      score,
      grade,
    });
    setHistory({ ...history, [today]: { score, grade } });
  };

  const renderCalendar = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const days = [];

    for (let i = 1; i <= end.getDate(); i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), i);
      const dateStr = d.toISOString().split("T")[0];
      const entry = history[dateStr];
      days.push(
        <div key={dateStr} className="calendar-day">
          <strong>{d.getDate()}</strong>
          <div>{entry ? `Score: ${entry.score}` : "--"}</div>
          <div>{entry ? `Grade: ${entry.grade}` : ""}</div>
        </div>
      );
    }
    return <div className="calendar-grid">{days}</div>;
  };

  return (
    <div className="App">
      <h1>Daily100</h1>
      <div className="nav">
        <button onClick={() => setView("today")}>Today</button>
        <button onClick={() => setView("calendar")}>Month</button>
      </div>
      <div className="date">{today}</div>
      {view === "today" && (
        <>
          <div className="checklist">
            {tasks.map((task) => (
              <label key={task.name}>
                <input
                  type="checkbox"
                  checked={checked[task.name] || false}
                  onChange={() => handleCheck(task.name)}
                />
                {task.name}
              </label>
            ))}
          </div>
          <div className="score">Score: {score}/100 ({grade})</div>
          <button onClick={handleSubmit}>Submit</button>
        </>
      )}
      {view === "calendar" && renderCalendar()}
    </div>
  );
}

export default App;
