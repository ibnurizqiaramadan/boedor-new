# Google OAuth Integration with NextAuth.js

This project now supports Google OAuth authentication using NextAuth.js with a self-hosted Convex database.

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=http://localhost:3210
CONVEX_SELF_HOSTED_URL=http://localhost:3210
CONVEX_SELF_HOSTED_ADMIN_KEY=your_admin_key_here

# NextAuth Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 2. Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Select "Web application"
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy the Client ID and Client Secret to your environment variables

### 3. Database Tables

The following tables are automatically created in Convex for NextAuth:

- `users` - Stores user information (email, name, image, emailVerified)
- `accounts` - Stores OAuth provider accounts linked to users
- `sessions` - Stores user sessions
- `verificationTokens` - Stores email verification tokens

### 4. Usage

- Visit `/google-auth` to test the Google OAuth integration
- Use the `LoginButton` component in your components
- Access session data using the `useSession()` hook from NextAuth

### 5. Components

- `LoginButton` - A reusable login/logout button component
- `AuthProvider` - Wraps the app with NextAuth SessionProvider
- `/auth/signin` - Custom sign-in page

## Notes

- The existing username/password authentication system is preserved
- All users (OAuth and username/password) are stored in the unified `users` table
- You can integrate both authentication systems as needed
