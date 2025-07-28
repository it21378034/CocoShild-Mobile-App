# Troubleshooting Network Connection Issues

## Problem: "Network Error" when fetching treatments

If you're seeing this error in your mobile app:
```
ERROR Error fetching treatments: [AxiosError: Network Error]
```

## Quick Fix Steps

### 1. Run the Setup Script
```bash
python setup_backend.py
```

This script will:
- Find your correct IP address
- Install missing dependencies
- Update the mobile app configuration
- Start the backend server

### 2. Manual Steps (if setup script doesn't work)

#### Step 1: Find Your IP Address
**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter.

**Mac/Linux:**
```bash
ifconfig
# or
ip addr
```

#### Step 2: Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Step 3: Start the Backend Server
```bash
cd backend
python main.py
```

You should see output like:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

#### Step 4: Update Mobile App Configuration
Edit `mobile/config/api.ts` and replace the IP address:
```typescript
export const API_BASE_URL = 'http://YOUR_IP_ADDRESS:8000';
```

#### Step 5: Test the Connection
Open your browser and go to:
```
http://YOUR_IP_ADDRESS:8000/test
```

You should see a JSON response confirming the server is running.

## Common Issues and Solutions

### Issue 1: "Connection refused"
**Cause:** Backend server is not running
**Solution:** Start the backend server with `python main.py`

### Issue 2: "Network Error" 
**Cause:** Wrong IP address or devices not on same network
**Solution:** 
1. Make sure both devices are on the same WiFi network
2. Use the correct IP address from `ipconfig`
3. Check Windows Firewall settings

### Issue 3: "Timeout"
**Cause:** Server is slow or network issues
**Solution:** 
1. Check if the server is responding at `http://YOUR_IP:8000/test`
2. Increase timeout in `mobile/config/api.ts`

### Issue 4: "Module not found" errors
**Cause:** Missing Python dependencies
**Solution:** Run `pip install -r backend/requirements.txt`

## Windows Firewall Settings

If you're still having issues on Windows:

1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Click "Change settings"
4. Find Python or add a new rule for port 8000
5. Allow it on both Private and Public networks

## Testing the Connection

### Test 1: Backend Health Check
```bash
curl http://YOUR_IP:8000/test
```

### Test 2: Treatments Endpoint
```bash
curl http://YOUR_IP:8000/treatments
```

### Test 3: From Mobile Device
1. Open browser on your mobile device
2. Go to `http://YOUR_IP:8000/test`
3. You should see a JSON response

## Network Configuration

### Required Network Setup:
- ✅ Both devices on same WiFi network
- ✅ Backend server running on `0.0.0.0:8000`
- ✅ Firewall allows connections on port 8000
- ✅ Correct IP address in mobile app config

### Optional: Use Localhost for Development
If you're testing on the same device, you can use:
```typescript
export const API_BASE_URL = 'http://localhost:8000';
```

## Debug Information

To get more detailed error information, check the mobile app logs:
1. Open Expo DevTools
2. Look for network request logs
3. Check the exact error message

## Still Having Issues?

1. **Check the backend logs** - Look for any error messages when starting the server
2. **Verify the model file** - Make sure `ml/model.h5` exists
3. **Check the treatment data** - Verify `data_sets/yellowing_disease_treatment_data.csv` exists
4. **Test with a simple endpoint** - Try accessing `/test` first before `/treatments`

## Support

If you're still experiencing issues, please provide:
1. Your operating system
2. The exact error message
3. Backend server logs
4. Mobile app logs 