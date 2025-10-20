
import React, { useState } from 'react';

interface CalendarViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ selectedDate, onDateChange }) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const today = new Date();
  const oneMonthFromToday = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };
  
  const renderDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return [...blanks, ...days].map((day, index) => {
      if (!day) {
        return <div key={`blank-${index}`} className="text-center p-2"></div>;
      }
      const date = new Date(year, month, day);
      const isSelected = isSameDay(date, selectedDate);
      const isToday = isSameDay(date, new Date());
      const isDisabled = date < new Date(new Date().toDateString()) || date > oneMonthFromToday;

      const baseClasses = "text-center p-2 w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-colors";
      let dayClasses = `${baseClasses}`;

      if (isDisabled) {
        dayClasses += ' text-gray-300 cursor-not-allowed';
      } else if (isSelected) {
        dayClasses += ' bg-indigo-600 text-white font-bold shadow';
      } else if (isToday) {
        dayClasses += ' bg-indigo-100 text-indigo-700 font-semibold';
      } else {
        dayClasses += ' hover:bg-slate-100 text-gray-600';
      }

      return (
        <div
          key={day}
          className={dayClasses}
          onClick={() => !isDisabled && onDateChange(date)}
        >
          {day}
        </div>
      );
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-100">&lt;</button>
        <h3 className="text-lg font-semibold text-gray-700">
          {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-100">&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">{day}</div>
        ))}
        {renderDays()}
      </div>
    </div>
  );
};

export default CalendarView;
