"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface CustomDatePickerProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function CustomDatePicker({ id, label, value, onChange, error, required }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse the current value to initialize calendar state, default to 30 years ago (typical DOB)
  const defaultDate = new Date();
  defaultDate.setFullYear(defaultDate.getFullYear() - 30);
  
  const parsedDate = value ? new Date(value) : defaultDate;
  const [currentMonth, setCurrentMonth] = useState(parsedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(parsedDate.getFullYear());

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Generate years (100 years back to current year)
  const currentActualYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentActualYear - i);

  // Generate calendar days
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDay }, (_, i) => i);

  const handleDateSelect = (day: number) => {
    // Format to YYYY-MM-DD
    const date = new Date(Date.UTC(currentYear, currentMonth, day));
    onChange(date.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const formattedDisplayValue = value 
    ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(value))
    : "";

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* Input Field */}
      <div 
        className={`relative flex w-full cursor-pointer items-center justify-between rounded-lg border bg-white px-3.5 py-2.5 text-sm transition-colors ${
          error ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:border-[#2563EB] focus:ring-[#2563EB]/20"
        } ${isOpen ? "ring-2 ring-[#2563EB]/20 border-[#2563EB]" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {formattedDisplayValue || "Select date..."}
        </span>
        <CalendarIcon className="h-5 w-5 text-gray-400" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-xl animate-slide-up">
          {/* Header Controls */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <button
              type="button"
              className="p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors"
              onClick={() => {
                if (currentMonth === 0) {
                  setCurrentMonth(11);
                  setCurrentYear(prev => prev - 1);
                } else {
                  setCurrentMonth(prev => prev - 1);
                }
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex gap-2 flex-1">
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                className="block w-full rounded-md border-0 py-1.5 pl-2 text-sm font-medium text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#2563EB] cursor-pointer bg-white"
              >
                {MONTHS.map((month, index) => (
                  <option key={month} value={index}>{month.substring(0,3)}</option>
                ))}
              </select>
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="block w-full rounded-md border-0 py-1.5 pl-2 text-sm font-medium text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#2563EB] cursor-pointer bg-white"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors"
              onClick={() => {
                if (currentMonth === 11) {
                  setCurrentMonth(0);
                  setCurrentYear(prev => prev + 1);
                } else {
                  setCurrentMonth(prev => prev + 1);
                }
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {paddingDays.map((_, i) => (
              <div key={`empty-${i}`} className="h-8 w-8" />
            ))}
            {days.map((day) => {
              const dateString = new Date(Date.UTC(currentYear, currentMonth, day)).toISOString().split('T')[0];
              const isSelected = value === dateString;
              const isToday = new Date().toISOString().split('T')[0] === dateString;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${
                    isSelected
                      ? "bg-[#2563EB] font-semibold text-white hover:bg-[#1D4ED8]"
                      : isToday
                      ? "bg-blue-50 font-semibold text-[#2563EB] hover:bg-blue-100"
                      : "text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
