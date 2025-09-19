'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { AllAttendanceTable } from '@/components/AllAttendanceTable';
import { ClockInModal } from '@/components/ClockInModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, AlertCircle, Loader2, RefreshCw, Users, UserCheck, Shield, CalendarDays } from 'lucide-react';
import { useAttendanceStore } from '@/store/attendanceStore';
import { useHydration } from '@/hooks/useHydration';
import { userService, UserStatistics } from '@/services/userService';
import { attendanceService, AttendanceStatsByDate } from '@/services/attendanceService';

export default function AdminDashboardPage() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const hydrated = useHydration();
  const [showClockInModal, setShowClockInModal] = useState(false);
  const [userStats, setUserStats] = useState<UserStatistics | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [dateStats, setDateStats] = useState<AttendanceStatsByDate | null>(null);
  const [loadingDateStats, setLoadingDateStats] = useState(false);
  const { 
    hasClockedInToday, 
    isLoading: attendanceLoading,
    todayAttendanceCount,
    refetchAll
  } = useAttendanceStore();

  const handleClockInSuccess = () => {
    refetchAll();
    setShowClockInModal(false);
  };

  const fetchUserStats = async () => {
    try {
      setLoadingStats(true);
      const stats = await userService.getUserStatistics();
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to fetch user statistics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchDateStats = async (date: string) => {
    try {
      setLoadingDateStats(true);
      const stats = await attendanceService.getAttendanceStatsByDate(date);
      setDateStats(stats);
    } catch (error) {
      console.error('Failed to fetch date statistics:', error);
      setDateStats({ total: 0, employees: 0, admins: 0 });
    } finally {
      setLoadingDateStats(false);
    }
  };

  useEffect(() => {
    if (hydrated) {
      fetchUserStats();
      if (selectedDate) {
        fetchDateStats(selectedDate);
      }
    }
  }, [hydrated, selectedDate]);

  const handleRefresh = () => {
    refetchAll();
    fetchUserStats();
    if (selectedDate) {
      fetchDateStats(selectedDate);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  if (!hydrated || attendanceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 h-full flex flex-col">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => { logout(); router.push('/login'); }}>Logout</Button>
        </div>
      </header>

      {/* Admin Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Attendance Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Attendance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${hasClockedInToday ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-2xl font-bold">
                {hasClockedInToday ? 'Present' : 'Absent'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {hasClockedInToday ? 'You have clocked in today' : 'You haven\'t clocked in yet'}
            </p>
            {!hasClockedInToday && (
              <Button 
                size="sm" 
                className="mt-2"
                onClick={() => setShowClockInModal(true)}
              >
                <Clock className="h-3 w-3 mr-1" />
                Clock In Now
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Today's Attendance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAttendanceCount}</div>
            <p className="text-xs text-muted-foreground">
              Employees clocked in today
            </p>
          </CardContent>
        </Card>

        {/* Total Employees Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : userStats?.employees || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered employees
            </p>
          </CardContent>
        </Card>

        {/* Total Admins Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : userStats?.admins || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              System administrators
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Date-based Attendance Statistics */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Attendance by Date</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="date-picker" className="text-sm font-medium">
              Select Date:
            </label>
            <input
              id="date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              max={new Date().toISOString().split('T')[0]} // Don't allow future dates
            />
          </div>
          {selectedDate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedDate('');
                setDateStats(null);
              }}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Date Statistics Cards - Only show when date is selected */}
        {selectedDate ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clock-ins</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingDateStats ? <Loader2 className="h-6 w-6 animate-spin" /> : dateStats?.total || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employees</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingDateStats ? <Loader2 className="h-6 w-6 animate-spin" /> : dateStats?.employees || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Employees clocked in
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admins</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingDateStats ? <Loader2 className="h-6 w-6 animate-spin" /> : dateStats?.admins || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Admins clocked in
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-4">
              <CalendarDays className="h-8 w-8 text-muted-foreground mb-2" />
              <h3 className="text-sm font-medium text-muted-foreground mb-1">No Date Selected</h3>
              <p className="text-xs text-muted-foreground text-center">
                Select a date above to view attendance statistics.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Admin Notice */}
      {!hasClockedInToday && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-amber-800 dark:text-amber-200">Attendance Reminder</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              As an HR/Admin, please ensure you clock in for accurate attendance tracking. 
              This helps maintain proper records for all employees including yourself.
            </CardDescription>
          </CardContent>
        </Card>
      )}

      <div className="flex-1">
        <AllAttendanceTable />
      </div>

      <ClockInModal
        isOpen={showClockInModal}
        onClose={() => setShowClockInModal(false)}
        onSuccess={handleClockInSuccess}
        title="Admin Clock In"
        description="Please provide a photo proof for your attendance record."
      />
    </div>
  );
}