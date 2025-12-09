# Mobile "Remember Me" Troubleshooting Guide

## Issue Reported
Users on mobile phones are being logged out when they close and reopen the browser, even when "Remember me" is checked.

## Improvements Made

### 1. Enhanced localStorage Handling
**Problem:** Mobile browsers can be aggressive about clearing data or have timing issues accessing localStorage.

**Solution:** Added robust localStorage wrapper functions with error handling:
- `getStoredToken()` - Safely retrieves token with error handling
- `setStoredToken()` - Safely stores token with error handling
- `removeStoredToken()` - Safely removes token with error handling

### 2. Improved Token Verification Logic
**Problem:** Network issues or failed verification would immediately log users out.

**Solution:** Modified `verifyToken()` to only logout on 401 (Unauthorized) errors, not network errors:
```javascript
// Only logout if token is actually invalid (401), not on network errors
if (error.response?.status === 401) {
  logout();
} else {
  // On network errors, keep the token but set loading to false
  setLoading(false);
}
```

### 3. Added Periodic Token Persistence Check
**Problem:** Some mobile browsers might clear localStorage unexpectedly.

**Solution:** Added a periodic check (every 5 seconds) to restore token if it gets cleared:
```javascript
const checkTokenPersistence = setInterval(() => {
  const storedToken = getStoredToken();
  if (!storedToken && token) {
    console.warn('Token was cleared from localStorage, re-storing...');
    setStoredToken(token);
  }
}, 5000);
```

### 4. localStorage Availability Detection
**Problem:** Private/incognito mode disables localStorage.

**Solution:** Added detection and user warning:
- Automatically detects if localStorage is disabled
- Shows a yellow warning banner explaining the limitation
- Prevents user confusion when "Remember me" doesn't work in private browsing

### 5. Enhanced Console Logging
**Problem:** Hard to debug issues on mobile devices.

**Solution:** Added comprehensive console logging throughout the auth flow:
- Login attempts with remember_me status
- Token storage success/failure
- Token verification attempts and results
- Initialization messages

## Mobile-Specific Considerations

### iOS Safari
**Known Issues:**
1. **Private Browsing Mode:** localStorage is completely disabled
2. **Low Storage:** iOS may clear localStorage when device storage is low
3. **Cross-Site Tracking Prevention:** May affect token storage in some cases

**Recommendations:**
- Ensure you're not in Private Browsing mode (look for the dark address bar)
- Check device storage (Settings > General > iPhone Storage)
- Update to latest iOS version

### Android Chrome/Samsung Internet
**Known Issues:**
1. **Data Saver Mode:** May clear cached data aggressively
2. **Site Settings:** User can disable storage per-site
3. **Battery Saver:** May clear data when battery is low

**Recommendations:**
- Check Data Saver settings (Settings > Data Saver)
- Verify site permissions (tap lock icon in address bar > Permissions)
- Ensure battery saver isn't too aggressive

## Testing on Mobile

### Step 1: Check Browser Mode
✅ Ensure you're NOT in private/incognito mode
- iOS Safari: Address bar should be light gray, not dark
- Chrome: No incognito icon in top corner

### Step 2: Verify Storage Warning
✅ When logging in, check if you see the yellow warning banner
- If you see it: localStorage is disabled (likely private browsing)
- If you don't: Storage should work correctly

### Step 3: Test Remember Me
1. Check "Remember me for 30 days"
2. Log in successfully
3. Close the browser app completely (swipe up from app switcher)
4. Wait 10 seconds
5. Reopen the browser and navigate to the app
6. You should be automatically logged in

### Step 4: Check Developer Console (Advanced)
**iOS Safari:**
1. Enable Web Inspector: Settings > Safari > Advanced > Web Inspector
2. Connect phone to Mac
3. Open Safari on Mac > Develop > [Your iPhone]
4. Check console for auth logs

**Android Chrome:**
1. Enable Developer Options on phone
2. Enable USB debugging
3. Connect to computer
4. Open `chrome://inspect` on desktop Chrome
5. Check console for auth logs

## What to Check If Still Having Issues

### 1. Check Browser Settings
- [ ] Ensure cookies/storage is enabled for the site
- [ ] Check if "Block third-party cookies" affects the app
- [ ] Verify site isn't in "Clear on exit" list

### 2. Check Device Settings
- [ ] Sufficient storage space (at least 1GB free)
- [ ] Not in low power mode (can clear data)
- [ ] Date/time is set correctly (affects JWT expiry)

### 3. Check Network Connection
- [ ] Stable internet connection during login
- [ ] Not behind aggressive firewall/proxy
- [ ] No VPN that might interfere with storage

### 4. Try Different Browser
Test with another browser to isolate the issue:
- iOS: Try Safari if using Chrome, or vice versa
- Android: Try Chrome, Firefox, or Samsung Internet

## Console Log Messages to Look For

### ✅ Good Messages (Working Correctly)
```
Initializing auth, stored token exists: true
Verifying token...
Token verified successfully, user: IgnitionLab Dynamics
```

### ⚠️ Warning Messages (Investigate)
```
Token was cleared from localStorage, re-storing...
Network error during verification, keeping user logged in
```

### ❌ Error Messages (Issue Detected)
```
Error accessing localStorage: [error]
Token is invalid (401), logging out
Token verification failed: [error]
```

## Long-Term Solutions (Future Enhancements)

### Option 1: Service Worker
Implement a service worker to cache authentication state even when localStorage is cleared.

### Option 2: Cookie-Based Auth
Add a secondary authentication mechanism using secure HTTP-only cookies as a fallback.

### Option 3: Refresh Tokens
Implement a refresh token system where long-lived refresh tokens (stored securely) can generate short-lived access tokens.

### Option 4: Biometric Auth
Add fingerprint/Face ID support for mobile devices to quickly re-authenticate without manual login.

## Contact Support
If you've tried all the above and are still experiencing issues:
1. Note your device model and OS version
2. Note your browser name and version
3. Collect console logs if possible
4. Report to the development team with these details

---

## Quick Reference: File Changes Made

- `/app/frontend/src/contexts/AuthContext.js` - Enhanced auth logic
- `/app/frontend/src/pages/Login.js` - Added storage detection and warning
- `/app/backend/models/user.py` - remember_me field
- `/app/backend/server.py` - Conditional token expiry
