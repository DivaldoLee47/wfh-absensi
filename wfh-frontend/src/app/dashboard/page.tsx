'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAttendanceStore } from '@/store/attendanceStore';
import { useRouter } from 'next/navigation';
import { attendanceService } from '@/services';
import toast from 'react-hot-toast';
import { useHydration } from '@/hooks/useHydration';
import { AttendanceHistory } from '@/components/AttendanceHistory';
import ProfileEdit from '@/components/ProfileEdit';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Camera, Clock, User, LogOut, Building2, CheckCircle, AlertCircle, Settings } from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated, role, logout } = useAuthStore();
  const { hasClockedInToday, isLoading: attendanceLoading, checkAttendanceStatus } = useAttendanceStore();
  const router = useRouter();
  const hydrated = useHydration();

  const [photo, setPhoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  
  useEffect(() => {
    if (hydrated) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (role === 'admin') {
        router.push('/admin/dashboard');
      } else if (role === 'employee') {
        checkAttendanceStatus();
      }
    }
  }, [hydrated, isAuthenticated, role, router, checkAttendanceStatus]);
  
  if (!hydrated || attendanceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (role !== 'employee') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleClockIn = async () => {
    if (!photo) {
      toast.error("Please select a photo as proof.");
      return;
    }

    setIsLoading(true);
    setIsSuccess(false);
    const loadingToastId = toast.loading('Submitting attendance...');

    try {
      await attendanceService.clockIn(photo);
      
      setIsSuccess(true);
      toast.success("Successfully clocked in!", { id: loadingToastId });
      
      // Refresh attendance status
      checkAttendanceStatus();
      
      // Reset form after success
      setTimeout(() => {
        const fileInput = document.getElementById('picture') as HTMLInputElement;
        if(fileInput) fileInput.value = "";
        setPhoto(null);
        setIsSuccess(false);
      }, 2000);
      
    } catch (error) {
      let errorMessage = "Clock-in failed. Please try again.";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      
      toast.error(errorMessage, { id: loadingToastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">WFH Attendance</h1>
              <p className="text-sm text-slate-300">Employee Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <User className="h-4 w-4 text-slate-300" />
              <span className="text-sm text-slate-300">Employee</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowProfileEdit(true)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Settings className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => { logout(); router.push('/login'); }}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
            <p className="text-slate-300 text-sm">Submit your daily attendance and track your work history</p>
          </div>

          {/* Clock In Section */}
          <Card className={`backdrop-blur-sm border-white/10 shadow-2xl ${
            hasClockedInToday 
              ? 'bg-green-500/10 border-green-500/20' 
              : 'bg-white/5'
          }`}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  hasClockedInToday 
                    ? 'bg-green-500/20' 
                    : 'bg-blue-500/20'
                }`}>
                  {hasClockedInToday ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <Clock className="h-5 w-5 text-blue-400" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg text-white">
                    {hasClockedInToday ? 'Already Clocked In' : 'Daily Clock In'}
                  </CardTitle>
                  <CardDescription className="text-slate-300 text-sm">
                    {hasClockedInToday 
                      ? 'You have successfully clocked in today' 
                      : 'Upload a photo proof to record your attendance'
                    }
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Photo Upload Section */}
              {!hasClockedInToday ? (
                <div className="space-y-3">
                  <Label htmlFor="picture" className="text-slate-200 font-semibold text-sm">
                    Photo Proof <span className="text-red-400">*</span>
                  </Label>
                  
                  <div className="relative">
                    <div className="flex items-center justify-center w-full">
                      <label 
                        htmlFor="picture" 
                        className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/30 rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 hover:border-white/50 transition-colors group"
                      >
                        <div className="flex flex-col items-center justify-center pt-3 pb-3">
                          <Camera className="w-6 h-6 mb-2 text-slate-400 group-hover:text-white transition-colors" />
                          <p className="mb-1 text-xs text-slate-300 group-hover:text-white transition-colors">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                            PNG, JPG, JPEG up to 10MB
                          </p>
                        </div>
                        <Input 
                          id="picture" 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={isLoading || isSuccess}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                    <p className="text-sm text-green-300">
                      You have already clocked in today. No further action required.
                    </p>
                  </div>
                </div>
              )}

              {/* Status Messages and Button - Only show when not clocked in */}
              {!hasClockedInToday && (
                <>
                  {photo && (
                    <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                      <p className="text-xs text-green-300">
                        Selected: {photo.name} ({(photo.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}
                  
                  {!photo && (
                    <div className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <AlertCircle className="h-3 w-3 text-amber-400 flex-shrink-0" />
                      <p className="text-xs text-amber-300">
                        Please select a photo to continue
                      </p>
                    </div>
                  )}

                  {/* Clock In Button */}
                  <div className="pt-2">
                    <Button 
                      onClick={handleClockIn} 
                      disabled={isLoading || !photo || isSuccess}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : isSuccess ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Success!
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-2" />
                          Clock In
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Attendance History Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Clock className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Attendance History</h3>
            </div>
            <AttendanceHistory />
          </div>
        </div>
      </main>

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <ProfileEdit
          onClose={() => setShowProfileEdit(false)}
          onSuccess={() => {
            toast.success('Profile updated successfully!');
          }}
        />
      )}
    </div>
  );
}