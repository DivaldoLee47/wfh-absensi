'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAttendanceStore } from '@/store/attendanceStore';
import { useHydration } from '@/hooks/useHydration';
import { useRouter } from 'next/navigation';
import { Loader2, Clock, AlertTriangle } from 'lucide-react';
import { AdminSideNav } from '@/components/AdminSideNav';
import { ClockInModal } from '@/components/ClockInModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const { isAuthenticated, role } = useAuthStore();
    const hydrated = useHydration();
    const router = useRouter();
    const { 
      hasClockedInToday, 
      isLoading: attendanceLoading, 
      checkAttendanceStatus,
      checkTodayAttendanceCount,
      refetchAll
    } = useAttendanceStore();
    const [showClockInModal, setShowClockInModal] = useState(false);
    const [showClockInPrompt, setShowClockInPrompt] = useState(false);
  
    useEffect(() => {
      if (hydrated) {
        if (!isAuthenticated || role !== 'admin') {
          router.push('/login');
        }
      }
    }, [hydrated, isAuthenticated, role, router]);

    useEffect(() => {
      if (hydrated && isAuthenticated && role === 'admin') {
        checkAttendanceStatus();
        checkTodayAttendanceCount();
      }
    }, [hydrated, isAuthenticated, role, checkAttendanceStatus, checkTodayAttendanceCount]);

    useEffect(() => {
      if (hydrated && isAuthenticated && role === 'admin' && !attendanceLoading) {
        if (!hasClockedInToday) {
          setShowClockInPrompt(true);
        }
      }
    }, [hydrated, isAuthenticated, role, attendanceLoading, hasClockedInToday]);

    const handleClockInSuccess = () => {
      refetchAll();
      setShowClockInPrompt(false);
      setShowClockInModal(false);
    };

    const handleProceedWithoutClockIn = () => {
      setShowClockInPrompt(false);
    };
  
    if (!hydrated) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated || role !== 'admin') {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Redirecting...</p>
          </div>
        </div>
      );
    }

    if (attendanceLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Checking attendance status...</p>
          </div>
        </div>
      );
    }

    if (showClockInPrompt) {
      return (
        <>
          <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle className="text-xl">Clock In Required</CardTitle>
                <CardDescription>
                  As an HR/Admin, you need to clock in before accessing the admin dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Why is this required?</p>
                    <p className="text-muted-foreground mt-1">
                      HR/Admin staff are also employees and need to record their attendance for accurate reporting and compliance.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleProceedWithoutClockIn}
                    className="flex-1"
                  >
                    Skip for Now
                  </Button>
                  <Button 
                    onClick={() => setShowClockInModal(true)}
                    className="flex-1"
                  >
                    Clock In Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
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
  
    return (
      <div className="flex h-screen bg-background">
        <AdminSideNav />
        <main className="flex-1 overflow-auto h-screen">
          <div className="p-4 sm:p-6 lg:p-8 h-full">
            {children}
          </div>
        </main>
        
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