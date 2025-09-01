'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export function RegisterForm() {
  const [ username, setUsername ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ role, setRole ] = useState<'driver' | 'user'>('user');
  const [ isLoading, setIsLoading ] = useState(false);
  const [ error, setError ] = useState('');
  const [ errors, setErrors ] = useState<{ username?: string; password?: string; role?: string }>({});
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const schema = z.object({
          username: z
          .string()
          .trim()
          .min(3, 'Nama pengguna minimal 3 karakter')
          .regex(/^\S+$/, 'Nama pengguna tidak boleh mengandung spasi'),
        password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
        role: z.enum([ 'driver', 'user' ], { message: 'Peran tidak valid' }),
      });
      const parsed = schema.safeParse({ username, password, role });
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
      const { username: cleanUsername, password: cleanPassword, role: cleanRole } = parsed.data;
      await register(cleanUsername, cleanPassword, cleanRole);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Daftar ke Boedor</CardTitle>
        <CardDescription>Buat akun baru untuk memulai</CardDescription>
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
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Peran
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'driver' | 'user')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="user">Pengguna</option>
              <option value="driver">Pengemudi</option>
            </select>
            {errors.role && (
              <div className="text-xs text-red-600">{errors.role}</div>
            )}
          </div>
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sedang mendaftar...' : 'Daftar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
