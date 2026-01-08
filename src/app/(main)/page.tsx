'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { LoginButton } from '@/components/auth/LoginButton';

export default function HomePage() {
  const { user, isLoading } = useAuth();

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
        <div className="w-full max-w-md space-y-8 p-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Selamat Datang di Boedor
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Silakan masuk menggunakan akun Google Anda
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="flex justify-center">
                <LoginButton />
              </div>
            </div>
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
            Selamat datang di Boedor, {user.username || user.name || user.email}!
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
