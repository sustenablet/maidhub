"use client";

import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Clock } from "lucide-react";

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8am–6pm
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface CalendarJob {
  id: string;
  client: string;
  service: string;
  dayIndex: number; // 0=Mon
  startHour: number;
  durationHours: number;
  color: string;
  textColor: string;
}

const mockJobs: CalendarJob[] = [
  {
    id: "1",
    client: "Sarah Johnson",
    service: "Deep Clean",
    dayIndex: 1,
    startHour: 10,
    durationHours: 2,
    color: "bg-teal-100 border-teal-300",
    textColor: "text-teal-800",
  },
  {
    id: "2",
    client: "Tom Wilson",
    service: "Regular Clean",
    dayIndex: 2,
    startHour: 14,
    durationHours: 1.5,
    color: "bg-purple-100 border-purple-300",
    textColor: "text-purple-800",
  },
  {
    id: "3",
    client: "Lisa Park",
    service: "Move-Out",
    dayIndex: 3,
    startHour: 9,
    durationHours: 3,
    color: "bg-amber-100 border-amber-300",
    textColor: "text-amber-800",
  },
  {
    id: "4",
    client: "David Brown",
    service: "Post-Construction",
    dayIndex: 5,
    startHour: 11,
    durationHours: 2,
    color: "bg-blue-100 border-blue-300",
    textColor: "text-blue-800",
  },
];

const CELL_HEIGHT = 56; // px per hour

// March 16–22 2026 (Mon–Sun)
const weekDates = [16, 17, 18, 19, 20, 21, 22];

export default function SchedulePage() {
  const [weekOffset] = useState(0);
  const hasJobs = mockJobs.length > 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#1A2332]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Schedule
          </h1>
          <p
            className="text-sm text-gray-400 mt-0.5"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Week of Mar {weekDates[0]}–{weekDates[6]}, 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              className="px-3 py-1 text-xs font-semibold text-[#1A2332] hover:bg-gray-50 rounded-lg transition-colors"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Today
            </button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            <Plus className="h-4 w-4" />
            New Job
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden relative">
        {/* Calendar grid */}
        <div className="overflow-x-auto">
          <div style={{ minWidth: 600 }}>
            {/* Day headers */}
            <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: "52px repeat(7, 1fr)" }}>
              <div className="border-r border-gray-100" />
              {DAYS.map((day, i) => (
                <div
                  key={day}
                  className="py-3 text-center border-r border-gray-100 last:border-r-0"
                >
                  <p
                    className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {day}
                  </p>
                  <p
                    className={`text-base font-bold mt-0.5 ${
                      weekDates[i] === 17
                        ? "text-white bg-teal-500 rounded-full w-7 h-7 flex items-center justify-center mx-auto text-sm"
                        : "text-[#1A2332]"
                    }`}
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {weekDates[i]}
                  </p>
                </div>
              ))}
            </div>

            {/* Time grid */}
            <div
              className="relative grid"
              style={{
                gridTemplateColumns: "52px repeat(7, 1fr)",
                height: HOURS.length * CELL_HEIGHT,
              }}
            >
              {/* Hour rows */}
              {HOURS.map((hour, hi) => (
                <div
                  key={hour}
                  className="contents"
                >
                  {/* Time label */}
                  <div
                    className="border-r border-gray-100 flex items-start justify-end pr-2 pt-1"
                    style={{ gridRow: hi + 1, gridColumn: 1, height: CELL_HEIGHT }}
                  >
                    <span
                      className="text-[10px] text-gray-300 font-medium"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {hour % 12 || 12}
                      {hour < 12 ? "am" : "pm"}
                    </span>
                  </div>
                  {/* Day cells */}
                  {DAYS.map((_, di) => (
                    <div
                      key={di}
                      className="border-r border-b border-gray-50 last:border-r-0 hover:bg-gray-50/30 transition-colors cursor-pointer"
                      style={{ gridRow: hi + 1, gridColumn: di + 2, height: CELL_HEIGHT }}
                    />
                  ))}
                </div>
              ))}

              {/* Job cards overlay */}
              {mockJobs.map((job) => {
                const topOffset = (job.startHour - HOURS[0]) * CELL_HEIGHT;
                const height = job.durationHours * CELL_HEIGHT - 4;
                const col = job.dayIndex + 2; // +2 for time column offset

                return (
                  <div
                    key={job.id}
                    className={`absolute rounded-xl border-l-2 px-2 py-1.5 cursor-pointer hover:shadow-md transition-shadow overflow-hidden ${job.color}`}
                    style={{
                      top: topOffset + 2,
                      height: height,
                      left: `calc(52px + ${job.dayIndex} * (100% - 52px) / 7 + 3px)`,
                      width: `calc((100% - 52px) / 7 - 6px)`,
                    }}
                  >
                    <p
                      className={`text-[11px] font-bold truncate ${job.textColor}`}
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {job.client}
                    </p>
                    <p
                      className={`text-[10px] truncate ${job.textColor} opacity-70`}
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {job.service}
                    </p>
                    {job.durationHours >= 1.5 && (
                      <div className={`flex items-center gap-0.5 mt-1 ${job.textColor} opacity-60`}>
                        <Clock className="h-2.5 w-2.5" />
                        <span className="text-[9px]" style={{ fontFamily: "'Syne', sans-serif" }}>
                          {job.startHour % 12 || 12}
                          {job.startHour < 12 ? "am" : "pm"} –{" "}
                          {(job.startHour + job.durationHours) % 12 || 12}
                          {(job.startHour + job.durationHours) < 12 ? "am" : "pm"}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Empty state overlay when no jobs */}
        {!hasJobs && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl">
            <div className="h-14 w-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
              <Plus className="h-7 w-7 text-teal-400" />
            </div>
            <h3
              className="text-base font-semibold text-[#1A2332] mb-2"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              No jobs this week
            </h3>
            <p
              className="text-sm text-gray-400 mb-6"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Schedule a new job to see it appear on the calendar
            </p>
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition-colors"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <Plus className="h-4 w-4" />
              New Job
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
