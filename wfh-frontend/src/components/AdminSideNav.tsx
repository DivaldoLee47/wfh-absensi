'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, Users, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClockInModal } from './ClockInModal';
import { Button } from './ui/button';
import { useAttendanceStore } from '@/store/attendanceStore';

export function AdminSideNav() {
  const pathname = usePathname();
  const [showClockInModal, setShowClockInModal] = useState(false);
  const { hasClockedInToday, checkAttendanceStatus } = useAttendanceStore();

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/users', label: 'Manage Users', icon: Users },
  ];

  const handleClockInSuccess = () => {
    checkAttendanceStatus();
    setShowClockInModal(false);
  };

  return (
    <>
      <nav className="flex flex-col w-64 h-screen bg-card border-r border-border text-card-foreground flex-shrink-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold">Admin Panel</h2>
          </div>
          
          {/* Navigation Items */}
          <div className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground',
                  { 'bg-accent text-accent-foreground': pathname === item.href }
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Clock In Section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Attendance</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <div className={cn(
                  "h-2 w-2 rounded-full flex-shrink-0",
                  hasClockedInToday ? "bg-green-500" : "bg-red-500"
                )} />
                <span className="text-muted-foreground">
                  {hasClockedInToday ? "Clocked in today" : "Not clocked in"}
                </span>
              </div>
              
              {!hasClockedInToday && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClockInModal(true)}
                  className="w-full justify-start"
                >
                  <Clock className="h-3 w-3 mr-2" />
                  Clock In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <ClockInModal
        isOpen={showClockInModal}
        onClose={() => setShowClockInModal(false)}
        onSuccess={handleClockInSuccess}
        title="Admin Clock In"
        description="Please provide a photo proof for your attendance record."
      />
    </>
  );
}