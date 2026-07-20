"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon, IconBox, NotificationIcon } from "@/components/icons";

type Notification = {
  id: string;
  type: "info" | "warning" | "success";
  title: string;
  message: string;
  href: string;
  timestamp: string;
};

const DISMISSED_KEY = "portfolio_dismissed_notifications";

function getDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveDismissed(ids: Set<string>) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]));
}

const typeStyles: Record<Notification["type"], string> = {
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  success: "bg-green-50 border-green-200 text-green-800",
};

export default function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDismissed(getDismissed());
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const visible = notifications.filter((n) => !dismissed.has(n.id));
  const unreadCount = visible.length;

  function dismiss(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    saveDismissed(next);
  }

  function dismissAll() {
    const next = new Set(dismissed);
    visible.forEach((n) => next.add(n.id));
    setDismissed(next);
    saveDismissed(next);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
      >
        <Icon name="bell" className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 animate-scale-in overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card-hover sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={dismissAll}
                className="text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
              </div>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-8 text-center">
                <IconBox name="bell" size="lg" variant="slate" />
                <p className="mt-3 text-sm font-medium text-slate-700">All caught up!</p>
                <p className="mt-0.5 text-xs text-slate-400">No new notifications</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {visible.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className="flex gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
                    >
                      <NotificationIcon type={n.type} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">{n.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{n.message}</p>
                        <span
                          className={`mt-1.5 inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${typeStyles[n.type]}`}
                        >
                          {n.type}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => dismiss(n.id, e)}
                        className="shrink-0 self-start rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                        aria-label="Dismiss notification"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
