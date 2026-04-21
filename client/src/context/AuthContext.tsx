'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession } from '@/lib/auth-client';

interface AuthContextType {
  user: { id: string; name: string; email: string } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

function extractId(id: any): string {
  if (typeof id === 'string') return id;
  if (id?.buffer) {
    const buf = id.buffer;
    return Array.from(Object.values(buf) as number[])
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return String(id);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ? { id: extractId(session.user.id), name: session.user.name, email: session.user.email } : null,
        isLoading: isPending,
        isAuthenticated: !!session?.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
