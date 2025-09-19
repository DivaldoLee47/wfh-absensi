import api from '@/lib/api';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'admin' | 'employee';
  created_at: string;
}

export interface UpdateUserRequest {
  full_name: string;
  email: string;
  role: 'admin' | 'employee';
}

export interface UpdateUserResponse {
  message: string;
  user: User;
}

export interface UserStatistics {
  total: number;
  employees: number;
  admins: number;
}

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  updateUser: async (userId: number, userData: UpdateUserRequest): Promise<UpdateUserResponse> => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  getUserStatistics: async (): Promise<UserStatistics> => {
    const response = await api.get('/admin/users/statistics');
    return response.data;
  },
};
