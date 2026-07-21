export default {
  providers: [
    {
      type: "customJwt",
      // Must exactly match the `iss` claim signed by /api/auth/convex-token (NEXTAUTH_URL)
      issuer: process.env.AUTH_JWT_ISSUER!,
      // Must be reachable from the Convex backend (docker: use host.docker.internal, not localhost)
      jwks: process.env.AUTH_JWKS_URL!,
      applicationID: "convex",
      algorithm: "RS256",
    },
  ],
};
