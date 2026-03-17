"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  SlidersHorizontal,
  MoreHorizontal,
  UserRound,
  Mail,
  Phone,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  jobsCount: number;
  lastJob: string;
  initials: string;
  color: string;
}

const mockClients: Client[] = [
  {
    id: "CL-001",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "(555) 234-5678",
    address: "Brooklyn, NY 11201",
    jobsCount: 8,
    lastJob: "Mar 15, 2026",
    initials: "SJ",
    color: "bg-teal-100 text-teal-700",
  },
  {
    id: "CL-002",
    name: "Tom Wilson",
    email: "twilson@email.com",
    phone: "(555) 876-5432",
    address: "Manhattan, NY 10001",
    jobsCount: 3,
    lastJob: "Mar 10, 2026",
    initials: "TW",
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "CL-003",
    name: "Lisa Park",
    email: "lisa.park@email.com",
    phone: "(555) 345-6789",
    address: "Queens, NY 11370",
    jobsCount: 12,
    lastJob: "Mar 17, 2026",
    initials: "LP",
    color: "bg-amber-100 text-amber-700",
  },
  {
    id: "CL-004",
    name: "David Brown",
    email: "dbrown@email.com",
    phone: "(555) 567-8901",
    address: "Bronx, NY 10451",
    jobsCount: 2,
    lastJob: "Feb 28, 2026",
    initials: "DB",
    color: "bg-blue-100 text-blue-700",
  },
];

export default function ClientsPage() {
  const [search, setSearch] = useState("");

  const filtered = mockClients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const isEmpty = mockClients.length === 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#1A2332]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Clients
          </h1>
          <p
            className="text-sm text-gray-400 mt-0.5"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Manage your client relationships
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          <Plus className="h-4 w-4" />
          Add Client
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-350" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 w-52 transition-all"
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
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="h-16 w-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
              <UserRound className="h-8 w-8 text-teal-400" />
            </div>
            <h3
              className="text-base font-semibold text-[#1A2332] mb-2"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Add your first client
            </h3>
            <p
              className="text-sm text-gray-400 mb-6 max-w-xs leading-relaxed"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Keep track of your clients, their contact info, and job history
              all in one place.
            </p>
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition-colors"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <Plus className="h-4 w-4" />
              Add Client
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p
              className="text-sm font-semibold text-[#1A2332]"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              No results for &ldquo;{search}&rdquo;
            </p>
            <p
              className="text-xs text-gray-400 mt-1"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Try a different name or email
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Name
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 hidden md:table-cell"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Email
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 hidden md:table-cell"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Phone
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 hidden lg:table-cell"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Address
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 hidden xl:table-cell"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Jobs
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 hidden xl:table-cell"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Last Job
                  </th>
                  <th className="px-5 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-full ${client.color} flex items-center justify-center text-xs font-bold shrink-0`}
                          style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                          {client.initials}
                        </div>
                        <div>
                          <p
                            className="text-sm font-semibold text-[#1A2332]"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                          >
                            {client.name}
                          </p>
                          <p className="text-xs text-gray-400 md:hidden">
                            {client.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-gray-300 shrink-0" />
                        <span
                          className="text-xs text-[#1A2332]/60"
                          style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                          {client.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-gray-300 shrink-0" />
                        <span
                          className="text-xs text-[#1A2332]/60"
                          style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                          {client.phone}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-5 py-4 text-xs text-[#1A2332]/55 hidden lg:table-cell"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {client.address}
                    </td>
                    <td className="px-5 py-4 hidden xl:table-cell">
                      <span
                        className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-teal-50 text-teal-700 text-xs font-bold"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                      >
                        {client.jobsCount}
                      </span>
                    </td>
                    <td
                      className="px-5 py-4 text-xs text-[#1A2332]/55 whitespace-nowrap hidden xl:table-cell"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {client.lastJob}
                    </td>
                    <td className="px-5 py-4">
                      <button className="text-gray-300 hover:text-gray-500 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
