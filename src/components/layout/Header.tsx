"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase/config';
import { signInWithPopup, GoogleAuthProvider, TwitterAuthProvider } from 'firebase/auth';
import { useApp } from '@/contexts/AppContext';
import { mockSignIn, mockSignOut } from '@/lib/mock-auth';
import { FaGoogle, FaTwitter, FaYenSign } from 'react-icons/fa';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

const Header = () => {
  const { user, firebaseUser, loading } = useAuth();
  const { isMockMode } = useApp();

  const handleSignIn = async (provider: 'google' | 'twitter') => {
    if (isMockMode) {
      await mockSignIn();
      return;
    }
    const authProvider = provider === 'google' ? new GoogleAuthProvider() : new TwitterAuthProvider();
    try {
      await signInWithPopup(auth, authProvider);
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };

  const handleSignOut = async () => {
    if (isMockMode) {
        await mockSignOut();
        window.location.reload();
        return;
    }
    await auth.signOut();
  };

  return (
    <header className="bg-background/90 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-3xl font-bold text-primary transition-colors hover:text-primary/90">
          <div className="bg-primary/10 p-2 rounded-lg">
            <FaYenSign className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 text-transparent bg-clip-text">
            Honor Purchaser
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          ) : firebaseUser ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground/80">{user?.displayName}</span>
                {user?.photoURL && (
                  <Image src={user.photoURL} alt={user.displayName || 'User'} width={40} height={40} className="rounded-full border-2 border-primary/50" />
                )}
              </div>
              <Button onClick={handleSignOut} variant="secondary" size="sm">Sign Out</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button onClick={() => handleSignIn('google')} variant="outline">
                <FaGoogle className="mr-2 h-4 w-4" /> Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
