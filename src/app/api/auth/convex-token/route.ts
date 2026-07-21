import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignJWT, importPKCS8 } from "jose";

// Issues a short-lived RS256 JWT for the Convex client, derived from the
// NextAuth session cookie. Convex validates it via convex/auth.config.ts + /api/auth/jwks.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse(null, { status: 401 });
  }

  const privateKey = await importPKCS8(
    process.env.CONVEX_AUTH_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    "RS256",
  );

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "RS256", kid: "convex-nextauth" })
    .setSubject(session.user.id)
    // NEXT_PUBLIC_CONVEX_URL as issuer: same value in every environment,
    // so one AUTH_JWT_ISSUER on the deployment covers dev and prod
    .setIssuer(process.env.NEXT_PUBLIC_CONVEX_URL!)
    .setAudience("convex")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);

  return new NextResponse(token, {
    headers: { "content-type": "text/plain", "cache-control": "no-store" },
  });
}
