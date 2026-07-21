# Google OAuth Integration Guide

This guide explains the two primary ways to integrate Google OAuth into the Fitmate application.

---

## Comparison: Choose Your Flow

| Feature | **ID Token Flow** (Current) | **Auth Code Flow** (Server-side) |
| :--- | :--- | :--- |
| **Mechanism** | Frontend gets a JWT (ID Token) and sends it to Backend. | Frontend gets a "code"; Backend exchanges it for tokens. |
| **Redirect URI** | Not required (handled via popup callback). | **Required** (Google redirects browser to your URI). |
| **Use Case** | Simple authentication & user profile retrieval. | Accessing Google APIs (Calendar, Drive) or offline access. |
| **Refresh Tokens** | No. User must re-authenticate when session ends. | Yes. Backend can refresh tokens in the background. |

---

## 1. ID Token Flow (Recommended for Fitmate)

This is the flow currently implemented in your `AuthModal.tsx`. It is optimized for SPAs and doesn't require complex redirect logic.

### How it works:
1.  **Frontend**: `<GoogleLogin />` opens a popup.
2.  **Success**: Google returns a `credential` (an ID Token JWT).
3.  **Backend**: `AuthService.googleAuth` sends the token to your server.
4.  **Verification**: Backend uses `google-auth-library` to verify the token:
    ```typescript
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    ```

---

## 2. Authorization Code Flow (Advanced)

If you need to access a user's Google Calendar or perform tasks while they are offline, you must use this flow.

### Implementation Steps:

#### A. Frontend Configuration
You must change the `GoogleLogin` to use `flow="auth-code"`.
```tsx
import { useGoogleLogin } from '@react-oauth/google';

const login = useGoogleLogin({
  onSuccess: codeResponse => {
    // This 'code' must be sent to the backend
    AuthService.sendAuthCode(codeResponse.code);
  },
  flow: 'auth-code',
});
```

#### B. Google Cloud Console Requirement
Unlike the ID Token flow, this **requires** a Redirect URI:
1.  Go to Credentials in Google Console.
2.  Add `http://localhost:5173` (or your production URL) to **Authorized Redirect URIs**.

#### C. Backend Token Exchange
Your backend must exchange the `code` for an `access_token` and `refresh_token` using your `CLIENT_SECRET`.
```typescript
const { tokens } = await client.getToken(code);
client.setCredentials(tokens);

// tokens.access_token -> for calling Google APIs
// tokens.refresh_token -> for getting new access tokens later
```

---

## 3. Google Cloud Console Setup (Common for Both)

1.  **Create Credentials**: Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  **Authorized JavaScript Origins**: Add `http://localhost:5173`.
3.  **Scopes**: Add `openid`, `email`, `profile`.
4.  **Authorized Redirect URIs**: (Only required for Auth Code Flow).

---

## 4. Security Checklist

*   **Audience Check**: Always verify the `audience` on the backend to prevent tokens from other apps being reused on yours.
*   **Provider Locking**: Ensure users who signed up with Google cannot have their accounts "taken over" by someone trying to register with the same email using a password.
*   **HTTPS**: OAuth tokens should never be transmitted over unencrypted HTTP.
