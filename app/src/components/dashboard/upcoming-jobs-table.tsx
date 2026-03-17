"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, Briefcase } from "lucide-react";

type JobStatus = "pending" | "confirmed" | "completed" | "cancelled";

interface Job {
  id: string;
  client: string;
  cleaner: string;
  serviceType: string;
  dateTime: string;
  location: string;
  status: JobStatus;
}

const mockJobs: Job[] = [
  {
    id: "JB-1001",
    client: "Sarah Johnson",
    cleaner: "Maria Lopez",
    serviceType: "Deep Clean",
    dateTime: "Mar 18, 2026, 10:00 AM",
    location: "Brooklyn, NY",
    status: "confirmed",
  },
  {
    id: "JB-1002",
    client: "Tom Wilson",
    cleaner: "Anna Chen",
    serviceType: "Regular Clean",
    dateTime: "Mar 19, 2026, 2:00 PM",
    location: "Manhattan, NY",
    status: "pending",
  },
  {
    id: "JB-1003",
    client: "Lisa Park",
    cleaner: "Maria Lopez",
    serviceType: "Move-Out",
    dateTime: "Mar 20, 2026, 9:00 AM",
    location: "Queens, NY",
    status: "confirmed",
  },
  {
    id: "JB-1004",
    client: "David Brown",
    cleaner: "Kate Smith",
    serviceType: "Post-Construction",
    dateTime: "Mar 22, 2026, 11:00 AM",
    location: "Bronx, NY",
    status: "pending",
  },
];

const statusConfig: Record<JobStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200",
  },
  completed: {
    label: "Completed",
    className: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  },
};

export function UpcomingJobsTable() {
  const [search, setSearch] = useState("");

  const filtered = mockJobs.filter(
    (j) =>
      j.client.toLowerCase().includes(search.toLowerCase()) ||
      j.id.toLowerCase().includes(search.toLowerCase()) ||
      j.serviceType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-base font-semibold text-[#1A2332]"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Upcoming Jobs
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-350" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 w-44 transition-all"
              style={{ fontFamily: "'Syne', sans-serif" }}
            />
          </div>
          <button
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#1A2332]/55 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#1A2332]/55 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors hidden sm:flex"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            ↕ Sort by
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-14 w-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-3">
            <Briefcase className="h-6 w-6 text-teal-400" />
          </div>
          <p
            className="text-sm font-semibold text-[#1A2332]"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            No jobs found
          </p>
          <p
            className="text-xs text-gray-400 mt-1"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {search
              ? "Try a different search term"
              : "Upcoming jobs will appear here"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th
                  className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 whitespace-nowrap"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Booking ID
                </th>
                <th
                  className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 whitespace-nowrap"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Client
                </th>
                <th
                  className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 whitespace-nowrap hidden md:table-cell"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Cleaner
                </th>
                <th
                  className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 whitespace-nowrap hidden lg:table-cell"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Service Type
                </th>
                <th
                  className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 whitespace-nowrap hidden lg:table-cell"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Date &amp; Time
                </th>
                <th
                  className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 whitespace-nowrap hidden xl:table-cell"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Location
                </th>
                <th
                  className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 whitespace-nowrap"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Status
                </th>
                <th className="px-4 py-3 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((job) => {
                const status = statusConfig[job.status];
                return (
                  <tr
                    key={job.id}
                    className="bg-white hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3.5 text-xs font-mono text-[#1A2332]/50">
                      {job.id}
                    </td>
                    <td
                      className="px-4 py-3.5 text-xs font-semibold text-[#1A2332]"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {job.client}
                    </td>
                    <td
                      className="px-4 py-3.5 text-xs text-[#1A2332]/55 hidden md:table-cell"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {job.cleaner}
                    </td>
                    <td
                      className="px-4 py-3.5 text-xs text-[#1A2332]/55 hidden lg:table-cell"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {job.serviceType}
                    </td>
                    <td
                      className="px-4 py-3.5 text-xs text-[#1A2332]/55 hidden lg:table-cell whitespace-nowrap"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {job.dateTime}
                    </td>
                    <td
                      className="px-4 py-3.5 text-xs text-[#1A2332]/55 hidden xl:table-cell"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {job.location}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${status.className}`}
                        style={{ fontFamily: "'Syne', sans-serif" }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button className="text-gray-300 hover:text-gray-500 transition-colors">
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <circle cx="8" cy="3.5" r="1.25" />
                          <circle cx="8" cy="8" r="1.25" />
                          <circle cx="8" cy="12.5" r="1.25" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
