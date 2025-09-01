'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export function LoginForm() {
  const [ username, setUsername ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ isLoading, setIsLoading ] = useState(false);
  const [ error, setError ] = useState('');
  const [ errors, setErrors ] = useState<{ username?: string; password?: string }>({});
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setErrors({});

    try {
      const schema = z.object({
        username: z.string().min(3, 'Nama pengguna minimal 3 karakter'),
        password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
      });
      const parsed = schema.safeParse({ username, password });
      if (!parsed.success) {
        const next: typeof errors = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path[0] as keyof typeof next;
          next[key] = issue.message;
        }
        setErrors(next);
        setIsLoading(false);
        return;
      }
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Masuk ke Boedor</CardTitle>
        <CardDescription>Masukkan kredensial Anda untuk mengakses aplikasi</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Nama Pengguna
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {errors.username && (
              <div className="text-xs text-red-600">{errors.username}</div>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Kata Sandi
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <div className="text-xs text-red-600">{errors.password}</div>
            )}
          </div>
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sedang masuk...' : 'Masuk'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
