"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  message: string;
  linkUrl: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // SSE for live unread count
  useEffect(() => {
    const es = new EventSource("/api/notifications/sse");
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setUnreadCount(data.unreadCount);
    };
    return () => es.close();
  }, []);

  // Load notifications when opening
  async function loadNotifications() {
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    }
  }

  async function markAllRead() {
    await fetch("/api/notifications/all/read", { method: "POST" });
    setNotifications((ns) => ns.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((ns) =>
      ns.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle() {
    if (!open) loadNotifications();
    setOpen((v) => !v);
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        type="button"
        className="relative p-2 rounded-full hover:bg-[#F1ECDF] transition-colors text-[#17254A]"
        aria-label={`${unreadCount} unread notifications`}
      >
        <Bell size={20} className="text-[#17254A]" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 bg-[#D98324] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-[#FFFFFF] rounded-2xl border border-[#E5DFD0] z-50 overflow-hidden shadow-lg animate-dropdown">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#E5DFD0] bg-[#FAF7F0]">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[#1C1B18] text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-[#FBEBD3] text-[#98590A] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#D98324]/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                type="button"
                className="text-xs font-semibold text-[#2E7D4F] hover:text-[#22633D] flex items-center gap-1 transition-colors"
              >
                <Check size={13} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-[#E5DFD0]">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-[#5E5C54]">
                <Bell size={30} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium text-[#1C1B18]">No notifications yet</p>
                <p className="text-xs text-[#5E5C54] mt-0.5">We will notify you about problem and solution updates</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 transition-colors ${
                    !n.isRead ? "bg-[#FAF7F0] hover:bg-[#F1ECDF]" : "hover:bg-[#FAF7F0]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#1C1B18] leading-snug font-medium">{n.message}</p>
                      <p className="text-xs text-[#5E5C54] mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 mt-0.5">
                      {n.linkUrl && (
                        <Link
                          href={n.linkUrl}
                          onClick={() => {
                            markRead(n.id);
                            setOpen(false);
                          }}
                          className="text-xs font-semibold text-[#2E7D4F] hover:text-[#22633D] no-underline inline-flex items-center gap-0.5"
                        >
                          <span>View</span>
                          <ExternalLink size={11} />
                        </Link>
                      )}
                      {!n.isRead && (
                        <button
                          onClick={() => markRead(n.id)}
                          type="button"
                          className="w-2.5 h-2.5 rounded-full bg-[#D98324] shrink-0 hover:scale-125 transition-transform"
                          title="Mark as read"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
