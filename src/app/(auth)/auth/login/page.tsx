'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { UtensilsCrossed, Users, MapPin, ShoppingBag } from 'lucide-react';

const highlights = [
  { icon: Users, text: 'Patungan pesan bareng teman' },
  { icon: ShoppingBag, text: 'Satu pesanan, banyak peserta' },
  { icon: MapPin, text: 'Lacak posisi driver realtime' },
];

function LoginContent() {
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
    <div className="min-h-dvh flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm py-12">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <UtensilsCrossed className="h-8 w-8" aria-hidden />
          </span>
          <h1 className="mt-5 font-display text-4xl text-foreground">Boedor</h1>
          <p className="mt-2 text-muted-foreground">
            Pesan makanan bareng, antar sekali jalan
          </p>
        </div>

        <ul className="mt-8 space-y-3">
          {highlights.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
            >
              <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              {text}
            </li>
          ))}
        </ul>

        <Button onClick={handleLogin} className="mt-8 h-12 w-full text-base shadow-md shadow-primary/25">
          Masuk Menggunakan Google
        </Button>

        {isDriver && (
          <p className="mt-4 text-center text-sm font-medium text-primary">
            Anda akan mendaftar sebagai Driver
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
