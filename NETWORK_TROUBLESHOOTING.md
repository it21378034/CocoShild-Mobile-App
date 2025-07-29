# Network Troubleshooting Guide

## Current Status
- ✅ Backend server running on port 8001
- ✅ Server accessible via localhost and network IP (192.168.18.73)
- ✅ Multiple fallback endpoints implemented in mobile app
- ⚠️ Still experiencing "Network request failed" errors

## Immediate Solutions

### 1. Check if Backend Server is Running
```bash
netstat -an | findstr :8001
```
Should show: `TCP    0.0.0.0:8001           0.0.0.0:0              LISTENING`

### 2. Test Local Connectivity
```bash
curl http://localhost:8001/test
curl http://192.168.18.73:8001/test
```
Both should return JSON responses.

### 3. Check Windows Firewall
1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Find Python in the list or add it manually
4. Ensure both Private and Public networks are checked

### 4. Test from Mobile Device
If testing on a physical device:
1. Ensure both devices are on the same WiFi network
2. Try pinging the computer's IP from the mobile device
3. Check if any antivirus software is blocking connections

## Enhanced Error Handling

The mobile app now includes:
- Multiple endpoint fallbacks (localhost, network IP, 127.0.0.1)
- Better error logging
- Graceful degradation when validation fails
- User-friendly error messages

## Debug Steps

### 1. Check Mobile App Logs
Look for these log messages:
```
Trying validation endpoint: http://192.168.18.73:8001/validate-coconut-leaf
Validation successful via http://192.168.18.73:8001/validate-coconut-leaf
Validation failed via http://192.168.18.73:8001/validate-coconut-leaf: [TypeError: Network request failed]
```

### 2. Test Individual Endpoints
Try each endpoint manually:
- `http://localhost:8001/test` (from computer)
- `http://192.168.18.73:8001/test` (from computer)
- `http://192.168.18.73:8001/test` (from mobile device)

### 3. Check Network Configuration
```bash
ipconfig /all
```
Look for:
- Correct IP address
- Subnet mask
- Default gateway
- DNS servers

## Common Issues and Solutions

### Issue 1: "Network request failed" on all endpoints
**Possible Causes:**
- Backend server not running
- Firewall blocking connections
- Wrong IP address
- Network connectivity issues

**Solutions:**
1. Restart backend server
2. Check firewall settings
3. Verify IP address
4. Test network connectivity

### Issue 2: Works on localhost but not network IP
**Possible Causes:**
- Firewall blocking external connections
- Server binding to localhost only
- Network configuration issues

**Solutions:**
1. Configure firewall to allow Python
2. Check server binding configuration
3. Verify network settings

### Issue 3: Works on computer but not mobile device
**Possible Causes:**
- Different network segments
- Mobile device firewall
- Network isolation

**Solutions:**
1. Ensure same WiFi network
2. Check mobile device settings
3. Try different network

## Alternative Solutions

### Option 1: Use Expo Development Server
```bash
cd mobile
npx expo start --tunnel
```
This creates a tunnel that bypasses local network issues.

### Option 2: Use ngrok for Tunneling
```bash
# Install ngrok
npm install -g ngrok

# Create tunnel to backend
ngrok http 8001
```
Then use the ngrok URL in your mobile app.

### Option 3: Deploy to Cloud
Deploy the backend to a cloud service (Heroku, AWS, etc.) and use the cloud URL.

## Testing Checklist

- [ ] Backend server running on port 8001
- [ ] Server accessible via localhost
- [ ] Server accessible via network IP
- [ ] Firewall configured correctly
- [ ] Mobile device on same network
- [ ] Network connectivity verified
- [ ] All endpoints tested
- [ ] Error logs reviewed

## Next Steps

1. **Test the enhanced error handling** - The app should now work even if some endpoints fail
2. **Monitor logs** - Check which endpoints are working/failing
3. **Consider cloud deployment** - For production use
4. **Implement proper error recovery** - Add retry mechanisms

## Support

If issues persist:
1. Check backend logs for detailed error messages
2. Test with simple curl commands
3. Verify network configuration
4. Consider using Expo's development tools 