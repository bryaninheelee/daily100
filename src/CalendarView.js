import React from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameDay,
  isSameMonth,
} from "date-fns";

function CalendarView({ selectedDate, scores, onDayClick }) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const fullDate = format(day, "yyyy-MM-dd");
      const entry = scores.find((s) => s.date === fullDate);

      const isToday = isSameDay(day, new Date());
      const isCurrentMonth = isSameMonth(day, monthStart);

      days.push(
        <div
          key={day}
          className={`border rounded p-2 text-center cursor-pointer transition-all
            ${!isCurrentMonth ? "text-gray-400" : ""}
            ${isToday ? "bg-blue-100" : ""}
            ${entry ? "bg-gray-100 hover:bg-gray-200" : "hover:bg-gray-50"}`}
          onClick={() => entry && onDayClick(entry.date)}
        >
          <div className="font-medium">{formattedDate}</div>
          {entry && (
            <div className="text-sm">
              {entry.score} ({entry.grade})
            </div>
          )}
        </div>
      );

      day = addDays(day, 1);
    }

    rows.push(
      <div className="grid grid-cols-7 gap-1" key={day}>
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="mt-4 space-y-1">
      <div className="grid grid-cols-7 text-center font-bold mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      {rows}
    </div>
  );
}

export default CalendarView;
