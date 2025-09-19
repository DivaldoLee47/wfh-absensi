import { create } from 'zustand';
import { attendanceService } from '@/services';

interface AttendanceState {
  hasClockedInToday: boolean;
  isLoading: boolean;
  error: string | null;
  todayAttendanceCount: number;
  todayCountLoading: boolean;
  todayCountError: string | null;
  
  checkAttendanceStatus: () => Promise<void>;
  checkTodayAttendanceCount: () => Promise<void>;
  refetchAll: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  hasClockedInToday: false,
  isLoading: true,
  error: null,
  todayAttendanceCount: 0,
  todayCountLoading: false,
  todayCountError: null,

  checkAttendanceStatus: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const attendances = await attendanceService.getMyAttendance();
      
      const today = new Date().toDateString();
      const hasTodayAttendance = attendances.some((attendance) => {
        const attendanceDate = new Date(attendance.clock_in).toDateString();
        return attendanceDate === today;
      });
      
      set({ hasClockedInToday: hasTodayAttendance, isLoading: false });
    } catch (err) {
      let errorMessage = 'Failed to check attendance status';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      
      set({ 
        error: errorMessage,
        hasClockedInToday: false,
        isLoading: false 
      });
    }
  },

  checkTodayAttendanceCount: async () => {
    try {
      set({ todayCountLoading: true, todayCountError: null });
      
      const data = await attendanceService.getTodayAttendanceCount();
      const count = data.count || 0;
      
      set({ todayAttendanceCount: count, todayCountLoading: false });
    } catch (err) {
      let errorMessage = 'Failed to fetch today attendance count';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      
      set({ 
        todayCountError: errorMessage,
        todayAttendanceCount: 0,
        todayCountLoading: false 
      });
    }
  },

  refetchAll: async () => {
    const { checkAttendanceStatus, checkTodayAttendanceCount } = get();
    await Promise.all([
      checkAttendanceStatus(),
      checkTodayAttendanceCount()
    ]);
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
}));
