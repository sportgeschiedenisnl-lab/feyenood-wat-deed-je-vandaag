
import React, { useState, useEffect } from 'react';

interface DatePickerProps {
  initialDate: Date;
  onSearch: (date: Date) => void;
}

const months = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december"
];

const DatePicker: React.FC<DatePickerProps> = ({ initialDate, onSearch }) => {
  const [currentDate, setCurrentDate] = useState(initialDate);

  useEffect(() => {
    setCurrentDate(initialDate);
  }, [initialDate]);

  const daysInMonth = new Date(2024, currentDate.getMonth() + 1, 0).getDate(); // Use leap year for Feb

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDay = parseInt(e.target.value, 10);
    const newDate = new Date(currentDate);
    newDate.setDate(newDay);
    setCurrentDate(newDate);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    const newDate = new Date(currentDate);
    
    const currentDay = newDate.getDate();
    newDate.setMonth(newMonth);

    const daysInNewMonth = new Date(2024, newMonth + 1, 0).getDate();
    if (currentDay > daysInNewMonth) {
        newDate.setDate(daysInNewMonth);
    }
    
    setCurrentDate(newDate);
  };
  
  const handleTodayClick = () => {
      const today = new Date();
      setCurrentDate(today);
      onSearch(today);
  }

  const handleSearchClick = () => {
    onSearch(currentDate);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 my-8 px-4">
      <div className="flex items-center gap-2">
        <label htmlFor="day-select" className="sr-only">Dag</label>
        <select
          id="day-select"
          value={currentDate.getDate()}
          onChange={handleDayChange}
          className="bg-gray-800 border border-gray-600 text-white p-3 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
        >
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
        <label htmlFor="month-select" className="sr-only">Maand</label>
        <select
          id="month-select"
          value={currentDate.getMonth()}
          onChange={handleMonthChange}
          className="bg-gray-800 border border-gray-600 text-white p-3 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
        >
          {months.map((month, index) => (
            <option key={month} value={index}>{month}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={handleSearchClick}
          className="bg-gray-700 text-white font-bold py-3 px-6 rounded-md hover:bg-gray-600 transition-colors duration-200"
        >
          Zoek
        </button>
        <button 
          onClick={handleTodayClick}
          className="bg-red-600 text-white font-bold py-3 px-6 rounded-md hover:bg-red-700 transition-colors duration-200"
        >
          Vandaag
        </button>
      </div>
    </div>
  );
};

export default DatePicker;