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

export interface User {
    id: number;
    full_name: string;
    email: string;
    role: 'admin' | 'employee';
    created_at: string;
}