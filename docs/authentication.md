# Authentication Guide

## Overview

otel-ui uses **OAuth2 PKCE (Proof Key for Code Exchange)** flow with AWS Cognito for secure authentication.

## Architecture

```text
User → otel-ui → oauth2-proxy (ingress) → AWS Cognito
                      ↓
                 Backend API (otel-demo)
```

**Key Points**:

- **Client-side authentication**: React app handles OAuth2 flow using `oidc-client-ts`
- **Ingress-level protection**: oauth2-proxy validates tokens at Kubernetes ingress
- **Stateless backend**: Flask API (otel-demo) trusts upstream authentication, no token validation

## OAuth2 PKCE Flow

### 1. Login Initiation

```typescript
// User clicks login button
authService.login()
  → Generates code_verifier and code_challenge (PKCE)
  → Redirects to: https://homelab-auth.auth.us-east-1.amazoncognito.com/oauth2/authorize
  → Query params: client_id, redirect_uri, response_type=code, code_challenge
```

### 2. Cognito Authentication

```text
User enters credentials at Cognito hosted UI
  → Cognito validates user
  → Redirects back: https://ui.lab.informationcart.com/callback?code=xxx
```

### 3. Token Exchange

```typescript
// Callback component handles redirect
authService.handleCallback()
  → Exchanges authorization code for tokens
  → POST https://homelab-auth.auth.us-east-1.amazoncognito.com/oauth2/token
  → Body: code, code_verifier, client_id, redirect_uri
  → Receives: access_token, id_token, refresh_token
  → Stores tokens in localStorage
  → Redirects to dashboard
```

### 4. API Calls

```typescript
// API client includes token in requests
axios.get('https://otel.lab.informationcart.com/info', {
  headers: {
    Authorization: `Bearer ${access_token}`,
  },
});
```

### 5. Logout

```typescript
// User clicks logout
authService.logout()
  → Clears localStorage
  → Redirects to: https://homelab-auth.auth.us-east-1.amazoncognito.com/logout
  → Query params: client_id, logout_uri, redirect_uri
  → Cognito clears session
  → Redirects back to: https://ui.lab.informationcart.com
```

**Note**: Both `logout_uri` and `redirect_uri` parameters are required (fixed in v1.0.32)

## Configuration

### AWS Cognito

| Setting      | Value                                         |
| ------------ | --------------------------------------------- |
| User Pool    | us-east-1_ZL7M5Qa7K                           |
| Region       | us-east-1                                     |
| Client ID    | 5j475mtdcm4qevh7q115qf1sfj                    |
| Client Type  | Public (no client secret)                     |
| Domain       | homelab-auth.auth.us-east-1.amazoncognito.com |
| Callback URL | https://ui.lab.informationcart.com/callback   |
| Logout URL   | https://ui.lab.informationcart.com            |

### Environment Variables

**Production** (`.env`):

```bash
VITE_COGNITO_DOMAIN=homelab-auth.auth.us-east-1.amazoncognito.com
VITE_COGNITO_CLIENT_ID=5j475mtdcm4qevh7q115qf1sfj
VITE_COGNITO_REDIRECT_URI=https://ui.lab.informationcart.com/callback
VITE_COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_ZL7M5Qa7K
```

**Development** (`.env.local`):

```bash
VITE_COGNITO_DOMAIN=homelab-auth.auth.us-east-1.amazoncognito.com
VITE_COGNITO_CLIENT_ID=5j475mtdcm4qevh7q115qf1sfj
VITE_COGNITO_REDIRECT_URI=http://localhost:5173/callback
VITE_COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_ZL7M5Qa7K
```

## Token Management

### Access Token

- **Purpose**: API authentication
- **Lifetime**: 1 hour
- **Storage**: localStorage (key: `oidc.user:issuer:client_id`)
- **Usage**: Included in `Authorization: Bearer` header

### Refresh Token

- **Purpose**: Obtain new access tokens without re-login
- **Lifetime**: 30 days
- **Storage**: localStorage (same key as access token)
- **Usage**: Automatic renewal via `automaticSilentRenew: true`

### ID Token

- **Purpose**: User identity information
- **Lifetime**: 1 hour
- **Storage**: localStorage
- **Usage**: Contains user profile (email, name, sub)

### Silent Token Renewal

```typescript
// UserManager configuration
{
  automaticSilentRenew: true,
  silent_redirect_uri: `${origin}/silent-renew.html`
}

// Events
userManager.events.addAccessTokenExpiring(() => {
  console.log('Access token expiring, attempting silent renewal...');
});

userManager.events.addSilentRenewError(error => {
  console.error('Silent renew error:', error);
  authService.logout(); // Force re-login
});
```

## Security Considerations

### PKCE Protection

- **Code Verifier**: Random 43-128 character string
- **Code Challenge**: SHA256 hash of code_verifier, base64url encoded
- **Purpose**: Prevents authorization code interception attacks

### Storage Security

- **localStorage**: Used for token storage (XSS risk mitigated by CSP)
- **No cookies**: Avoids CSRF attacks
- **HTTPS only**: All production URLs use TLS

### Session Management

- **Automatic expiry**: Tokens expire after 1 hour
- **Silent renewal**: Background token refresh before expiry
- **Forced logout**: On renewal failure or token expiration

## Troubleshooting

### "Required String parameter 'redirect_uri' is not present"

**Issue**: Logout fails with Cognito error dialog

**Cause**: Missing `redirect_uri` parameter in logout URL

**Solution**: Fixed in v1.0.32 - both `logout_uri` and `redirect_uri` now included

### User stuck on callback page

**Issue**: Callback URL shows loading forever

**Cause**: Authorization code exchange failed

**Debug**:

```javascript
// Check browser console for errors
// Check localStorage for partial state
localStorage.getItem('oidc.user:...');
```

**Solution**:

```javascript
// Clear localStorage and retry
localStorage.clear();
// Redirect to home
window.location.href = '/';
```

### Token renewal fails

**Issue**: User logged out after 1 hour

**Cause**: Silent renewal failed (CORS, network, expired refresh token)

**Debug**:

```typescript
userManager.events.addSilentRenewError(error => {
  console.error('Silent renew error:', error);
});
```

**Solution**:

- Check `silent-renew.html` exists in `public/`
- Verify CORS allows `POST` to Cognito token endpoint
- Check refresh token hasn't expired (30 days)

### CORS errors during login

**Issue**: "Access to XMLHttpRequest blocked by CORS policy"

**Cause**: Invalid redirect URI or CORS misconfiguration

**Solution**:

- Verify callback URL exactly matches Cognito configuration
- Check oauth2-proxy CORS settings in K8s ingress

## Testing

### Manual Testing

```bash
# 1. Start development server
npm run dev

# 2. Open browser
http://localhost:5173

# 3. Login flow
- Click login → redirects to Cognito
- Enter credentials → redirects back
- Check localStorage has tokens

# 4. API calls
- Navigate to testing page
- Verify endpoints work
- Check Authorization header in Network tab

# 5. Logout
- Click logout → redirects to Cognito
- Redirects back to homepage
- Verify localStorage cleared
```

### Automated Testing

```bash
# Playwright end-to-end tests
npx playwright test tests/auth-flow.spec.ts

# What it tests:
- Login redirect
- Callback handling
- Token storage
- API authentication
- Logout
```

## Implementation Details

### AuthService Class

Location: `src/services/auth.ts`

**Key Methods**:

- `login()` - Initiates OAuth2 flow
- `handleCallback()` - Processes authorization code
- `logout()` - Clears session and redirects
- `getUser()` - Returns current user
- `isAuthenticated()` - Checks auth status
- `getAccessToken()` - Returns token for API calls

### API Client Integration

Location: `src/services/api.ts`

```typescript
// Request interceptor adds token
axiosInstance.interceptors.request.use(async config => {
  const token = await authService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor handles 401
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await authService.logout(); // Force re-login
    }
    throw error;
  }
);
```

## Related Documentation

- [Project Plan](project-plan.md) - Implementation roadmap
- [AWS Cognito Configuration](../../homelab-infrastructure/docs/operations.md)
- [K8s oauth2-proxy Setup](../../k8s-gitops/infrastructure/auth/oauth2-proxy/)
- [oidc-client-ts Documentation](https://github.com/authts/oidc-client-ts)

## Version History

| Version | Date       | Changes                               |
| ------- | ---------- | ------------------------------------- |
| 1.0.32  | 2026-01-23 | Fixed logout redirect_uri parameter   |
| 1.0.31  | 2026-01-23 | Database endpoint path fixes          |
| 1.0.29  | 2026-01-20 | Initial authentication implementation |
