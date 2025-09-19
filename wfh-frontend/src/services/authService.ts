import api from '@/lib/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    full_name: string;
    email: string;
    role: 'admin' | 'employee';
  };
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  role: 'admin' | 'employee';
}

export interface RegisterResponse {
  message: string;
  user: {
    id: number;
    full_name: string;
    email: string;
    role: 'admin' | 'employee';
  };
}

export interface UpdateProfileRequest {
  full_name: string;
  email: string;
  password?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: {
    id: number;
    full_name: string;
    email: string;
    role: 'admin' | 'employee';
  };
}

export interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  role: 'admin' | 'employee';
}

export const authService = {

  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  updateProfile: async (profileData: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
