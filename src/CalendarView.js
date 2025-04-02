// src/CalendarView.js
import React from "react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameDay, parseISO } from "date-fns";

const CalendarView = ({ entries, onDateClick }) => {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const day = calendarStart;
  const rows = [];

  while (day <= calendarEnd) {
    const days = [];

    for (let i = 0; i < 7; i++) {
      const dateStr = format(day, "yyyy-MM-dd");
      const entry = entries.find((e) => isSameDay(parseISO(e.date), day));

      days.push(
        <div
          key={day}
          onClick={() => onDateClick(dateStr)}
          className={`p-2 h-20 w-20 border text-center cursor-pointer ${
            entry ? "bg-blue-100" : ""
          }`}
        >
          <div className="font-semibold">{format(day, "d")}</div>
          {entry && (
            <div className="text-sm">
              {entry.score} ({entry.grade})
            </div>
          )}
        </div>
      );

      day.setDate(day.getDate() + 1);
    }

    rows.push(
      <div className="flex" key={day}>
        {days}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-7 text-sm text-gray-700 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div className="text-center font-semibold" key={d}>
            {d}
          </div>
        ))}
      </div>
      {rows}
    </div>
  );
};

export default CalendarView;
