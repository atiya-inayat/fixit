'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, LayoutDashboard, LogOut } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated } = useAuth();

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <MapPin className="h-6 w-6 text-red-500" />
          FixIt
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>

          {isAuthenticated ? (
            <>
              <Link href="/issues/new">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground">{user?.name}</span>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
