# Mobile Users: How to Use "Remember Me"

## Quick Start

### ✅ What You Need
1. **Regular browsing mode** (not private/incognito)
2. **Enough phone storage** (at least 1GB free)
3. **Stable internet connection**

### 📱 Step-by-Step Instructions

#### 1. Open the App in Your Mobile Browser
- **iOS:** Use Safari or Chrome
- **Android:** Use Chrome, Firefox, or Samsung Internet

#### 2. Make Sure You're NOT in Private Mode
**iOS Safari:**
- Private mode has a **dark address bar**
- Regular mode has a **light gray address bar**
- If dark, tap the tabs button and select "Private" to toggle it off

**Chrome (iOS & Android):**
- Look for the incognito icon (hat & glasses) at the top
- If you see it, you're in incognito mode
- Close the tab and open a new regular tab

#### 3. Log In with "Remember Me"
1. Enter your username and password
2. **Check the box** "Remember me for 30 days"
3. Tap "Sign In"

#### 4. Test It Works
1. Close your browser app completely (swipe it away from app switcher)
2. Wait 10 seconds
3. Reopen your browser and go back to the app
4. **You should be automatically logged in!**

---

## 🔧 Troubleshooting

### Issue: I checked "Remember Me" but I'm still being logged out

#### Solution 1: Check Browser Mode
Make sure you're not in private/incognito mode (see instructions above).

#### Solution 2: Check Storage Settings
**iOS:**
1. Go to Settings > Safari > Advanced
2. Make sure "Website Data" is not set to be cleared

**Android Chrome:**
1. Open Chrome menu > Settings > Privacy
2. Check "Clear browsing data"
3. Make sure the site isn't in "Clear on exit"

#### Solution 3: Free Up Storage
Low phone storage can cause browsers to clear data:
- Delete unused apps
- Clear old photos/videos
- Aim for at least 1GB free space

#### Solution 4: Check the Warning Message
- If you see a **yellow warning** below the checkbox, it means storage is disabled
- This happens in private mode or if storage permissions are blocked
- Switch to regular browsing mode

### Issue: How do I know if it's working?

Visit the **Diagnostics Page** to check:
```
https://[your-app-url]/auth-diagnostics
```

You should see:
- ✅ localStorage Available: Yes
- ✅ Token Exists: Yes
- ✅ Token Valid: Yes

---

## 📋 Quick Checklist

Before reporting an issue, verify:
- [ ] Not in private/incognito mode
- [ ] Phone has 1GB+ free storage
- [ ] Browser is up to date
- [ ] Site isn't in "Clear on exit" list
- [ ] Cookies/storage enabled for the site
- [ ] No VPN interfering with storage

---

## 🆘 Still Having Issues?

### Get Help:
1. Visit `/auth-diagnostics` in your browser
2. Tap "Export Report" button
3. Send the report to support with:
   - Your phone model (e.g., "iPhone 14 Pro")
   - OS version (e.g., "iOS 17.2")
   - Browser name and version (e.g., "Safari 17.2")

---

## 💡 Pro Tips

### Tip 1: Add to Home Screen (iOS & Android)
Adding the app to your home screen can improve persistence:
- iOS Safari: Tap Share → Add to Home Screen
- Android Chrome: Menu → Add to Home Screen

### Tip 2: Don't Force-Quit the App
Constantly force-quitting your browser can clear data. Just switch between apps normally.

### Tip 3: Check Battery Saver Settings
Aggressive battery saver modes can clear app data. Consider adding your browser to "Protected" or "Unrestricted" apps.

### Tip 4: Use the Same Browser
Switching between browsers means you'll need to log in again. Pick one browser and stick with it.

---

## ⚙️ Advanced: For Tech-Savvy Users

### Access Console Logs (iOS)
1. Settings > Safari > Advanced > Web Inspector: ON
2. Connect iPhone to Mac
3. Open Safari on Mac > Develop > [Your iPhone] > [App Tab]
4. Look for auth-related logs

### Access Console Logs (Android)
1. Enable Developer Options on phone
2. Enable USB Debugging
3. Connect to computer
4. Open `chrome://inspect` on desktop Chrome
5. Click "Inspect" on your app
6. Check console for auth messages

### What to Look For:
✅ Good:
```
Initializing auth, stored token exists: true
Token verified successfully
```

❌ Bad:
```
Error accessing localStorage
Token is invalid (401)
```

---

## 📱 Browser-Specific Notes

### Safari (iOS)
- Most reliable for this app
- Private mode completely disables storage
- Cross-site tracking prevention may affect some features

### Chrome (iOS & Android)
- Works well in regular mode
- Incognito mode disables localStorage
- Data Saver mode may interfere

### Firefox (Android)
- Works reliably
- Check "Delete browsing data on quit" setting
- Private browsing disables storage

### Samsung Internet (Android)
- Generally works well
- Check "Secret mode" is off
- Verify storage permissions

---

## 🔒 Privacy & Security

### Is it safe?
- Yes! The token is stored locally on your device only
- It's encrypted and signed by the server
- It automatically expires (30 days for "Remember Me", 24 hours otherwise)
- You can manually log out anytime

### What data is stored?
- Only a secure authentication token
- No passwords or sensitive data
- Token expires automatically

### Can I clear it?
Yes! Either:
- Log out normally (recommended)
- Clear your browser data (Settings > Clear browsing data)
- Visit `/auth-diagnostics` and the app will detect it's gone
