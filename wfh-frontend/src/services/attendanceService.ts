import api from '@/lib/api';

export interface AttendanceRecord {
  id: number;
  user_id: number;
  clock_in: string;
  photo_url: string;
  created_at: string;
}

export interface AdminAttendanceRecord {
  id: number;
  clock_in: string;
  photo_url: string;
  full_name: string;
  email: string;
}

export interface ClockInRequest {
  photo: File;
}

export interface ClockInResponse {
  message: string;
  attendance: AttendanceRecord;
}

export interface TodayAttendanceCountResponse {
  count: number;
}

export interface AttendanceStatsByDate {
  total: number;
  employees: number;
  admins: number;
}

export const attendanceService = {
  clockIn: async (photo: File): Promise<ClockInResponse> => {
    const formData = new FormData();
    formData.append('photo', photo);
    
    const response = await api.post('/attendance/clock-in', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getMyAttendance: async (): Promise<AttendanceRecord[]> => {
    const response = await api.get('/attendance/me');
    return response.data;
  },

  getTodayAttendanceCount: async (): Promise<TodayAttendanceCountResponse> => {
    const response = await api.get('/attendance/today');
    return response.data;
  },

  getAllAttendance: async (): Promise<AdminAttendanceRecord[]> => {
    const response = await api.get('/admin/attendance');
    return response.data;
  },

  getAttendanceStatsByDate: async (date: string): Promise<AttendanceStatsByDate> => {
    const response = await api.get(`/admin/attendance/stats/${date}`);
    return response.data;
  },
};
