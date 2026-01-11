import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

const handler = async (req: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) => {
  // Check if the request is for driver registration
  const url = new URL(req.url);
  
  // Check for driver parameter in various places
  const driverFromQuery = url.searchParams.get('driver') === 'true';
  const driverFromCallback = url.searchParams.get('callbackUrl')?.includes('driver=true');
  const driverFromCallbackUrl = url.searchParams.get('callbackUrl')?.includes('%3Fdriver%3Dtrue');
  
  // Also check if this is the callback from Google OAuth
  // We need to detect driver registration from the state parameter or session
  let isDriver = driverFromQuery || driverFromCallback || driverFromCallbackUrl;
  
  // For Google callback, check if we have a driver registration in progress
  if (url.pathname.includes('/callback/google') && !isDriver) {
    // We can't access session storage here, so we'll use a different approach
    // Check the state parameter or use a custom cookie that was set before OAuth
    const cookies = await req.cookies;
    const driverCookie = cookies.get('driver-registration');
    isDriver = driverCookie?.value === 'true';
  }
  
  console.log('NextAuth route - Driver detected:', {
    driverFromQuery,
    driverFromCallback,
    driverFromCallbackUrl,
    isDriver,
    url: req.url
  });
  
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
    console.log('Driver registration cookie set');
  }
  
  return NextAuth(authOptions)(req, context);
};

export { handler as GET, handler as POST };
