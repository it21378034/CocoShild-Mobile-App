# Network Setup Guide for Coconut Disease Detection App

## Issue Summary
The mobile app was experiencing "Network request failed" errors when trying to validate images. This was caused by:
1. Backend server running on wrong port (8001 vs 8000)
2. Network connectivity issues between mobile app and backend
3. Windows Firewall blocking external connections

## Solutions Implemented

### 1. Fixed Port Configuration
- ✅ Backend server now runs on port 8001 (as configured in main.py)
- ✅ Mobile app updated to use port 8001 for all API calls
- ✅ API configuration centralized in `mobile/config/api.ts`

### 2. Updated API Endpoints
All API calls now use the correct port:
- Validation endpoint: `http://localhost:8001/validate-coconut-leaf`
- Diagnosis endpoint: `http://localhost:8001/diagnose-multiple`
- All other endpoints use the centralized API configuration

### 3. Backend Server Status
- ✅ Server is running and accessible on localhost:8001
- ✅ Test endpoint responding correctly
- ✅ All endpoints available and functional

## Testing the Fix

### For Local Development (Same Device)
1. Ensure backend server is running:
   ```bash
   cd backend
   python main.py
   ```

2. Test local connection:
   ```bash
   curl http://localhost:8001/test
   ```

3. Run the mobile app - it should now connect successfully

### For External Device Testing (Mobile/Tablet)

#### Option 1: Use Computer's IP Address
1. Find your computer's IP address:
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" under your active network adapter

2. Update the API configuration:
   ```typescript
   // In mobile/config/api.ts
   export const API_BASE_URL = 'http://YOUR_IP_ADDRESS:8001';
   ```

3. Configure Windows Firewall:
   - Open Windows Defender Firewall
   - Click "Allow an app or feature through Windows Defender Firewall"
   - Click "Change settings" and "Allow another app"
   - Browse to your Python executable
   - Ensure both Private and Public networks are checked

#### Option 2: Use Expo Development Server
1. Install Expo CLI if not already installed:
   ```bash
   npm install -g @expo/cli
   ```

2. Start Expo development server:
   ```bash
   cd mobile
   npx expo start
   ```

3. Use Expo's tunnel or LAN options for external device access

## Troubleshooting

### If Still Getting Network Errors:

1. **Check Backend Server Status**:
   ```bash
   netstat -an | findstr :8001
   ```
   Should show: `TCP    0.0.0.0:8001           0.0.0.0:0              LISTENING`

2. **Test Local Connection**:
   ```bash
   curl http://localhost:8001/test
   ```
   Should return a JSON response

3. **Check Firewall Settings**:
   - Ensure Python is allowed through Windows Firewall
   - Temporarily disable firewall for testing (remember to re-enable)

4. **Verify IP Address**:
   - Make sure you're using the correct IP address for your network
   - Test connectivity with `ping YOUR_IP_ADDRESS`

### Common Issues and Solutions:

1. **"Network request failed" Error**:
   - Backend server not running
   - Wrong port number
   - Firewall blocking connection
   - Wrong IP address

2. **"Connection refused" Error**:
   - Server not started
   - Port already in use
   - Wrong host binding

3. **"Timeout" Error**:
   - Network connectivity issues
   - Server overloaded
   - Firewall blocking

## Development vs Production

### Development Setup (Current)
- Uses localhost for same-device testing
- Backend runs on port 8001
- No authentication required
- Debug logging enabled

### Production Setup (Future)
- Deploy backend to cloud server
- Use HTTPS endpoints
- Implement proper authentication
- Add rate limiting and security measures

## Next Steps

1. **Test the current fix** - Try capturing and diagnosing images
2. **For external device testing** - Follow the external device setup guide
3. **Monitor logs** - Check for any remaining network issues
4. **Consider production deployment** - When ready for real-world use

## Support

If you continue to experience issues:
1. Check the backend logs for error messages
2. Verify network connectivity
3. Test with a simple curl command first
4. Consider using Expo's development tools for debugging 