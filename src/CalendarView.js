import React from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth, parseISO } from "date-fns";

const CalendarView = ({ data, view, selectedDate, onSelectDate }) => {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const rows = [];
  let days = [];
  let day = startDate;

  const scoresByDate = Object.fromEntries(
    data.map((entry) => [entry.date, entry])
  );

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const formattedDate = format(day, "yyyy-MM-dd");
      const displayDate = format(day, "d");
      const isCurrentMonth = isSameMonth(day, monthStart);
      const entry = scoresByDate[formattedDate];
      const isSelected = selectedDate === formattedDate;

      days.push(
        <div
          key={day}
          className={`border rounded p-1 text-center text-sm cursor-pointer ${
            !isCurrentMonth ? "text-gray-400" : ""
          } ${isSelected ? "bg-gray-200" : ""}`}
          onClick={() => onSelectDate(formattedDate)}
        >
          <div className="font-semibold">{displayDate}</div>
          {entry && (
            <div className="text-xs">
              {entry.score} ({entry.grade})
            </div>
          )}
        </div>
      );
      day = addDays(day, 1);
    }

    rows.push(
      <div key={day} className="grid grid-cols-7 gap-1">
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="mt-4 space-y-1">
      <div className="grid grid-cols-7 text-center font-medium text-sm mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      {rows}
    </div>
  );
};

export default CalendarView;
