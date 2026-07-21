import { NextResponse } from "next/server";
import { importPKCS8, exportJWK } from "jose";

// Serves the public half of CONVEX_AUTH_PRIVATE_KEY so the Convex backend
// can verify tokens issued by /api/auth/convex-token.
export async function GET() {
  const privateKey = await importPKCS8(
    process.env.CONVEX_AUTH_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    "RS256",
    { extractable: true },
  );
  const { d, p, q, dp, dq, qi, ...publicJwk } = await exportJWK(privateKey);

  return NextResponse.json({
    keys: [{ ...publicJwk, alg: "RS256", use: "sig", kid: "convex-nextauth" }],
  });
}
