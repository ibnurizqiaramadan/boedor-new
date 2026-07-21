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
    <div className="min-h-screen bg-muted">
      <nav className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-foreground">
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
          <div className="border-4 border-dashed border-border rounded-lg p-8">
            {session ? (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold">Welcome, {session.user?.name}!</h1>
                <div className="bg-card p-4 rounded shadow">
                  <h2 className="text-lg font-semibold mb-2">Session Data:</h2>
                  <pre className="bg-muted p-4 rounded overflow-auto">
                    {JSON.stringify(session, null, 2)}
                  </pre>
                </div>
                <div className="bg-blue-400/10 p-4 rounded">
                  <p className="text-sm text-blue-300">
                    You are successfully authenticated with Google OAuth!
                    Your user data is stored in Convex database.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold">Google OAuth Authentication</h1>
                <p className="text-muted-foreground">
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
