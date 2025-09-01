'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [ showRegister, setShowRegister ] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Memuat...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md space-y-4">
          {showRegister ? <RegisterForm /> : <LoginForm />}
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setShowRegister(!showRegister)}
            >
              {showRegister ?
                'Sudah punya akun? Masuk' :
                'Belum punya akun? Daftar'
              }
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Selamat datang di Boedor, {user.username}!
          </h1>
          <p className="mt-2 text-gray-600">
            Anda masuk sebagai <span className="font-medium capitalize">{user.role}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.role === 'admin' && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Kelola Pengguna</h3>
                <p className="mt-2 text-gray-600">Lihat dan kelola semua pengguna dalam sistem</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Kelola Menu</h3>
                <p className="mt-2 text-gray-600">Kelola item menu dan harga</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Kelola Pesanan</h3>
                <p className="mt-2 text-gray-600">Lihat dan kelola semua pesanan</p>
              </div>
            </>
          )}

          {user.role === 'driver' && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Item Menu</h3>
                <p className="mt-2 text-gray-600">Lihat dan tambah item menu</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Pesanan Saya</h3>
                <p className="mt-2 text-gray-600">Kelola pesanan pengiriman Anda</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Update Lokasi</h3>
                <p className="mt-2 text-gray-600">Perbarui posisi Anda saat ini</p>
              </div>
            </>
          )}

          {user.role === 'user' && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Jelajahi Pesanan</h3>
                <p className="mt-2 text-gray-600">Lihat pesanan yang tersedia untuk bergabung</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Tambah Item Menu</h3>
                <p className="mt-2 text-gray-600">Usulkan item menu baru</p>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
