"use client";

import { useState } from "react";
import { Bell, Briefcase, Receipt, Settings, Check, BellOff } from "lucide-react";

type NotifCategory = "all" | "jobs" | "invoices" | "system";

interface Notification {
  id: string;
  category: "jobs" | "invoices" | "system";
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const mockNotifications: Notification[] = [
  {
    id: "n1",
    category: "jobs",
    title: "Job Confirmed",
    message: "Sarah Johnson confirmed her Deep Clean for Mar 18 at 10:00 AM.",
    timestamp: "2 hours ago",
    unread: true,
    icon: Briefcase,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-500",
  },
  {
    id: "n2",
    category: "invoices",
    title: "Payment Received",
    message: "Invoice INV-0041 for $280 has been paid by Sarah Johnson.",
    timestamp: "5 hours ago",
    unread: true,
    icon: Receipt,
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
  },
  {
    id: "n3",
    category: "jobs",
    title: "New Job Request",
    message: "Mike Chen has requested a Move-Out Clean for Mar 25.",
    timestamp: "Yesterday",
    unread: true,
    icon: Briefcase,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-500",
  },
  {
    id: "n4",
    category: "invoices",
    title: "Invoice Overdue",
    message: "INV-0040 for $320 from David Brown is now overdue by 11 days.",
    timestamp: "2 days ago",
    unread: false,
    icon: Receipt,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
  },
  {
    id: "n5",
    category: "system",
    title: "Trial Ending Soon",
    message: "Your free trial ends in 14 days. Upgrade to keep access.",
    timestamp: "3 days ago",
    unread: false,
    icon: Settings,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  {
    id: "n6",
    category: "jobs",
    title: "Job Completed",
    message: "Lisa Park's Regular Clean on Mar 15 was marked as completed.",
    timestamp: "Mar 15",
    unread: false,
    icon: Briefcase,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-500",
  },
];

const tabs: { label: string; value: NotifCategory }[] = [
  { label: "All", value: "all" },
  { label: "Jobs", value: "jobs" },
  { label: "Invoices", value: "invoices" },
  { label: "System", value: "system" },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<NotifCategory>("all");
  const [notifications, setNotifications] = useState(mockNotifications);

  const filtered =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.category === activeTab);

  const unreadCount = notifications.filter((n) => n.unread).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#1A2332]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Notifications
          </h1>
          <p
            className="text-sm text-gray-400 mt-0.5"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {unreadCount > 0 ? (
              <span>
                <strong className="text-[#1A2332]">{unreadCount}</strong> unread
              </span>
            ) : (
              "You're all caught up"
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#1A2332]/60 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-colors"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            <Check className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 p-3 border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === tab.value
                  ? "bg-teal-50 text-teal-700"
                  : "text-gray-400 hover:text-[#1A2332] hover:bg-gray-50"
              }`}
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {tab.label}
              {tab.value === "all" && unreadCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-teal-500 text-white text-[9px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Feed */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <BellOff className="h-7 w-7 text-gray-300" />
            </div>
            <p
              className="text-sm font-semibold text-[#1A2332]"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              No notifications
            </p>
            <p
              className="text-xs text-gray-400 mt-1"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {activeTab === "all"
                ? "You'll be notified about jobs, invoices, and more"
                : `No ${activeTab} notifications yet`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((notif) => {
              const Icon = notif.icon;
              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors cursor-pointer ${
                    notif.unread ? "bg-teal-50/20" : ""
                  }`}
                  onClick={() => markRead(notif.id)}
                >
                  {/* Icon */}
                  <div
                    className={`h-10 w-10 rounded-xl ${notif.iconBg} flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    <Icon className={`h-5 w-5 ${notif.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm font-semibold ${notif.unread ? "text-[#1A2332]" : "text-[#1A2332]/70"}`}
                        style={{ fontFamily: "'Syne', sans-serif" }}
                      >
                        {notif.title}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className="text-xs text-gray-400 whitespace-nowrap"
                          style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                          {notif.timestamp}
                        </span>
                        {notif.unread && (
                          <div className="h-2 w-2 rounded-full bg-teal-500 shrink-0" />
                        )}
                      </div>
                    </div>
                    <p
                      className="text-xs text-gray-400 mt-0.5 leading-relaxed"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {notif.message}
                    </p>
                    {/* Category chip */}
                    <span
                      className="inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 capitalize"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {notif.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
