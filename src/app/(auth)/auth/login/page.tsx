'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDriver = searchParams.get('driver') === 'true';

  useEffect(() => {
    // If driver=true is in URL, keep it for the OAuth flow
    if (isDriver) {
      // Store in session storage as fallback
      sessionStorage.setItem('driver-registration', 'true');
    }
  }, [isDriver]);

  const handleLogin = () => {
    // Check if this is driver registration from URL
    if (isDriver) {
      document.cookie = 'driver-registration=true; path=/; max-age=300; SameSite=Lax';
    }
    
    // Redirect based on whether it's driver registration or normal login
    const callbackUrl = isDriver ? '/?driver=true' : '/';
    
    signIn('google', { 
      callbackUrl,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Masuk ke Boedor
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Gunakan akun Google Anda untuk masuk
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <div className="flex justify-center">
            <Button onClick={() => handleLogin()} className="w-full">
              Masuk Menggunakan Google
            </Button>
          </div>
          {isDriver && (
            <p className="text-center text-sm text-blue-600">
              Anda akan mendaftar sebagai Driver
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
