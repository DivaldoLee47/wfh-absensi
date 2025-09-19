'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useHydration } from '@/hooks/useHydration';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { checkTokenValidity } = useAuthStore();
  const hydrated = useHydration();

  useEffect(() => {
    if (hydrated) {
      checkTokenValidity();
    }
  }, [hydrated, checkTokenValidity]);

  return <>{children}</>;
}
