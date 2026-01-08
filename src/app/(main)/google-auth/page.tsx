"use client";

import { useSession } from "next-auth/react";
import { LoginButton } from "@/components/auth/LoginButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GoogleAuthPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Boedor
              </Link>
            </div>
            <div className="flex items-center">
              <LoginButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            {session ? (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold">Welcome, {session.user?.name}!</h1>
                <div className="bg-white p-4 rounded shadow">
                  <h2 className="text-lg font-semibold mb-2">Session Data:</h2>
                  <pre className="bg-gray-100 p-4 rounded overflow-auto">
                    {JSON.stringify(session, null, 2)}
                  </pre>
                </div>
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-blue-800">
                    You are successfully authenticated with Google OAuth!
                    Your user data is stored in Convex database.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold">Google OAuth Authentication</h1>
                <p className="text-gray-600">
                  This page demonstrates NextAuth.js with Google OAuth integration.
                  User data is stored in your self-hosted Convex database.
                </p>
                <div className="mt-8">
                  <LoginButton />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
