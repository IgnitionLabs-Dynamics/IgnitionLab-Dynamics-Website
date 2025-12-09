# Remember Me Feature

## Overview
The "Remember Me" feature has been successfully implemented to allow users to stay logged in for an extended period without needing to re-authenticate every time they reopen the browser.

## Implementation Details

### Backend Changes

#### 1. Updated User Login Model (`/app/backend/models/user.py`)
- Added `remember_me: bool = False` field to the `UserLogin` Pydantic model
- This field is optional and defaults to `False` if not provided

#### 2. Updated Login Endpoint (`/app/backend/server.py`)
- Modified the `/api/auth/login` endpoint to handle different token expiry times
- **When `remember_me = True`**: Token expires in **30 days**
- **When `remember_me = False`**: Token expires in **24 hours** (default)

```python
# If "Remember Me" is checked, token lasts 30 days. Otherwise, 24 hours.
if user_login.remember_me:
    access_token_expires = timedelta(days=30)
else:
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
```

### Frontend Changes

#### 1. Updated Login Component (`/app/frontend/src/pages/Login.js`)
- Added `rememberMe` state to track checkbox status
- Added a checkbox UI element with the label "Remember me for 30 days"
- Positioned between the password field and login button for optimal UX
- Passes the `rememberMe` value to the `login()` function

#### 2. Updated Authentication Context (`/app/frontend/src/contexts/AuthContext.js`)
- Modified the `login()` function to accept a third parameter: `rememberMe`
- Sends `remember_me` field in the API request payload
- Token is stored in `localStorage` (which persists across browser sessions)

## User Experience

### With "Remember Me" Checked ✓
1. User checks the "Remember me for 30 days" checkbox
2. Upon successful login, a JWT token valid for 30 days is issued
3. User can close the browser and return anytime within 30 days without needing to log in again

### Without "Remember Me" (Default)
1. User leaves the checkbox unchecked
2. Upon successful login, a JWT token valid for 24 hours is issued
3. User stays logged in for 24 hours, but will need to re-authenticate after that period

## Security Considerations

### Token Storage
- Tokens are stored in browser `localStorage`
- This provides persistence across browser sessions while remaining client-side only

### Token Expiry
- The backend enforces token expiry using JWT's standard `exp` claim
- Expired tokens are automatically rejected by the backend
- No additional cleanup is needed on the frontend

### Best Practices
✓ Tokens are transmitted securely over HTTPS
✓ Tokens include expiration timestamps
✓ Backend validates token signature and expiry on every request
✓ Users can manually log out anytime, which clears the token

## Testing Results

### Test 1: Login with "Remember Me" checked ✅
- Checkbox is visible and functional
- Token is generated with 30-day expiry
- User successfully logs in and is redirected to dashboard
- Token is stored in localStorage

### Test 2: Login without "Remember Me" ✅
- Checkbox defaults to unchecked state
- Token is generated with 24-hour expiry
- User successfully logs in and is redirected to dashboard
- Token is stored in localStorage

### Test 3: Backend API ✅
- Direct API testing confirms different token expiry times based on `remember_me` flag
- Token expiry decoded from JWT confirms correct implementation:
  - `remember_me = true`: ~30 days
  - `remember_me = false`: 24 hours

## Files Modified

### Backend
- `/app/backend/models/user.py` - Added `remember_me` field to UserLogin model
- `/app/backend/server.py` - Updated login endpoint to handle different token expiries

### Frontend
- `/app/frontend/src/pages/Login.js` - Added checkbox UI and state management
- `/app/frontend/src/contexts/AuthContext.js` - Updated login function to pass remember_me parameter

## Usage for End Users

The feature is straightforward and requires no configuration:

1. **Navigate to the login page**
2. **Enter your credentials** (username and password)
3. **Check the "Remember me for 30 days" checkbox** if you want to stay logged in
4. **Click "Sign In"**

That's it! If you checked "Remember me", you won't need to log in again for 30 days.

## Future Enhancements (Optional)

Potential improvements for future iterations:
- [ ] Add a "Trusted devices" management page where users can view and revoke active sessions
- [ ] Implement refresh tokens for even longer sessions without security trade-offs
- [ ] Add IP-based restrictions or device fingerprinting for enhanced security
- [ ] Provide user notifications when their long-lived token is about to expire
