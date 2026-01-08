import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

const handler = async (req: NextRequest, context: any) => {
  // Check if the request is for driver registration
  const url = new URL(req.url);
  
  // Check for driver parameter in various places
  const driverFromQuery = url.searchParams.get('driver') === 'true';
  const driverFromCallback = url.searchParams.get('callbackUrl')?.includes('driver=true');
  const isDriver = driverFromQuery || driverFromCallback;
  
  // Store the driver flag in a cookie for the adapter to use
  if (isDriver) {
    const cookieStore = await cookies();
    cookieStore.set('driver-registration', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 5, // 5 minutes
    });
  }
  
  return NextAuth(authOptions)(req, context);
};

export { handler as GET, handler as POST };
