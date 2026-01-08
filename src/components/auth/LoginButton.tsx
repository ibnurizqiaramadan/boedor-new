"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LoginButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Button disabled>Loading...</Button>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        {session.user?.image && (
          <img
            src={session.user.image}
            alt={session.user.name || ""}
            className="w-8 h-8 rounded-full"
          />
        )}
        <span className="text-sm font-medium">{session.user?.name}</span>
        <Button onClick={() => signOut()} variant="outline">
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => signIn("google")}>
      Sign in with Google
    </Button>
  );
}
