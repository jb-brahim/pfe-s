'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Search, ChevronDown, Upload, FileText, Users, BarChart3, X } from 'lucide-react';
import { notificationAPI, invoiceAPI } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<any>(null);
  const quickActionRef = useRef<HTMLDivElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationAPI.getAll();
        setNotifications(response.data || []);
      } catch (error) {
        console.log('Failed to fetch notifications');
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (quickActionRef.current && !quickActionRef.current.contains(e.target as Node)) {
        setShowQuickAction(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard shortcut: Ctrl/Cmd + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('navbar-search')?.focus();
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowNotifications(false);
        setShowQuickAction(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live search invoices as user types
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.length < 2) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }

    setSearching(true);
    setShowSearch(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await invoiceAPI.getAll(undefined, value);
        setSearchResults((res.data || []).slice(0, 5));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  // Quick upload from navbar
  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setShowQuickAction(false);
      try {
        await invoiceAPI.uploadFile(e.target.files[0]);
        router.push('/invoices');
      } catch (err) {
        console.error('Upload failed', err);
      }
      if (uploadRef.current) uploadRef.current.value = '';
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatCurrency = (val: number) => new Intl.NumberFormat('fr-TN', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val) + ' TND';

  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'Home';
    return segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
  };

  return (
    <nav className="h-16 w-full flex items-center justify-between px-6 md:px-8 bg-transparent z-30 border-b border-white/[0.04]">
      {/* Search Bar */}
      <div className="hidden md:flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2 w-[320px] relative">
        <Search className="w-4 h-4 text-[#A69697]" strokeWidth={1.5} />
        <input
          id="navbar-search"
          type="text"
          placeholder="Search invoices..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setShowSearch(true)}
          className="flex-1 bg-transparent text-[#FFFFFF] placeholder:text-[#A69697] outline-none text-[14px]"
        />
        {searchQuery ? (
          <button onClick={() => { setSearchQuery(''); setShowSearch(false); setSearchResults([]); }} className="text-[#A69697] hover:text-white">
            <X size={14} />
          </button>
        ) : (
          <kbd className="text-[11px] text-[#A69697]/60 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">⌘K</kbd>
        )}

        {/* Search Results Dropdown */}
        {showSearch && (
          <div className="absolute top-12 left-0 w-full bg-[#1A0A0B] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
            {searching ? (
              <p className="text-[#A69697] text-[13px] p-4 text-center">Searching...</p>
            ) : searchResults.length === 0 ? (
              <p className="text-[#A69697] text-[13px] p-4 text-center">No results for "{searchQuery}"</p>
            ) : (
              searchResults.map((inv) => (
                <Link
                  key={inv._id}
                  href={`/invoices/${inv._id}`}
                  onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                  className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/[0.03] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={14} className="text-[#D98F8F]" />
                    <div>
                      <p className="text-white text-[13px] font-medium">{inv.companyName || 'Unknown'}</p>
                      <p className="text-[#A69697] text-[11px]">{inv.invoiceNumber || '—'}</p>
                    </div>
                  </div>
                  <span className="text-white text-[13px] font-medium">{formatCurrency(inv.totalAmount || 0)}</span>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex-1 md:hidden">
        <span className="text-white text-[15px] font-medium">{getPageTitle()}</span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={() => document.documentElement.classList.toggle('theme-light')}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-transparent border border-transparent text-[#A69697] hover:text-[#FFFFFF] hover:bg-white/[0.04] transition-colors"
          title="Toggle theme"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowQuickAction(false); }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-transparent border border-transparent text-[#A69697] hover:text-[#FFFFFF] hover:bg-white/[0.04] transition-colors relative"
          >
            <Bell className="w-4 h-4" strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#B34E56] rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-12 right-0 w-80 bg-[#1A0A0B] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <h3 className="font-semibold text-white text-[14px]">Notifications</h3>
                <span className="text-[#A69697] text-[11px]">{notifications.length} total</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-[#A69697] text-[13px] px-4 py-6 text-center">No notifications yet</p>
                ) : (
                  notifications.slice(0, 8).map((notif) => (
                    <div
                      key={notif._id}
                      className="px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer border-b border-white/[0.03] last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          notif.severity === 'HIGH' ? 'bg-red-400' : notif.severity === 'MEDIUM' ? 'bg-amber-400' : 'bg-[#D98F8F]'
                        }`} />
                        <div>
                          <p className="text-white text-[13px] font-medium leading-tight">{notif.title}</p>
                          <p className="text-[#A69697] text-[11px] mt-0.5">{notif.message || notif.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Button */}
        <div className="relative" ref={quickActionRef}>
          <button
            onClick={() => { setShowQuickAction(!showQuickAction); setShowNotifications(false); }}
            className="hidden sm:flex items-center gap-1.5 bg-[#8E1B3A] text-white px-4 py-2 rounded-xl font-medium text-[13px] hover:bg-[#7B112C] transition-colors ml-1"
          >
            Quick Action
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showQuickAction ? 'rotate-180' : ''}`} strokeWidth={2} />
          </button>

          {showQuickAction && (
            <div className="absolute top-12 right-0 w-52 bg-[#1A0A0B] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-1.5">
                <button
                  onClick={() => uploadRef.current?.click()}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#A69697] hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                >
                  <Upload size={14} className="text-[#D98F8F]" /> Upload Invoice
                </button>
                <input type="file" className="hidden" ref={uploadRef} accept=".pdf,.png,.jpg,.jpeg" onChange={handleQuickUpload} />

                <Link
                  href="/invoices"
                  onClick={() => setShowQuickAction(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#A69697] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <FileText size={14} className="text-[#D98F8F]" /> View Invoices
                </Link>

                <Link
                  href="/reports"
                  onClick={() => setShowQuickAction(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#A69697] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <BarChart3 size={14} className="text-[#D98F8F]" /> Generate Report
                </Link>

                <Link
                  href="/team"
                  onClick={() => setShowQuickAction(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#A69697] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Users size={14} className="text-[#D98F8F]" /> Manage Team
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
