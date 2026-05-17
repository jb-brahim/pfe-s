'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, Bell, Upload, CommandIcon } from 'lucide-react';
import { notificationAPI, mockNotifications } from '@/lib/api';

export function TopNavbar() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const result = await notificationAPI.getAll();
        setUnreadCount(result.data?.length || 0);
      } catch {
        setUnreadCount(mockNotifications.length);
      }
    };

    fetchNotifications();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/invoices?search=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 lg:left-64 glass-card border-b border-white/10 px-6 flex items-center justify-between z-30">
      {/* Left: Search Bar */}
      <div className="flex-1 max-w-md">
        {showSearch ? (
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Search size={20} className="text-white/40" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => setShowSearch(false)}
              autoFocus
              className="glass-input flex-1 text-sm"
            />
          </form>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card text-white/60 hover:text-white transition-colors w-full justify-between"
          >
            <span className="text-sm">Search or ask...</span>
            <div className="flex items-center gap-1 text-xs">
              <CommandIcon size={16} />
              <span>K</span>
            </div>
          </button>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 ml-6">
        {/* Upload Button */}
        <Link
          href="/invoices"
          className="hidden sm:flex items-center gap-2 btn-rose-gold text-sm"
        >
          <Upload size={18} />
          <span>Upload Invoice</span>
        </Link>

        {/* Notifications Bell */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-lg glass-card hover:bg-white/10 transition-colors"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
