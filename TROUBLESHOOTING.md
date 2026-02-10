# Troubleshooting: Demo Data Load Failure

## Common Issues and Solutions

### Issue 1: "Unauthorized" or "401 Error"
**Problem**: Not logged in  
**Solution**:
1. Go to Login page
2. Login with your credentials
3. Try loading demo data again

### Issue 2: "Network Error" or "Cannot connect"
**Problem**: Backend server not running  
**Solution**:
1. Check if backend is running (should see NestJS output in terminal)
2. Backend should be on `http://localhost:3000`
3. If not running, restart with `npm start`

### Issue 3: "Failed to load demo data" Message
**Problem**: Could be various backend errors  
**Solution**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click "Load Demo Data" again
4. Check for red error messages
5. Look for the actual error text

### Issue 4: TypeScript Compilation Errors
**Problem**: Backend won't compile  
**Solution**:
The TypeScript warnings are just linting issues and won't prevent the code from running.
- The code uses `as any` type assertions which bypass strict typing
- Runtime execution should work fine

### Issue 5: Data Not Appearing After "Success"
**Problem**: Page didn't refresh  
**Solution**:
1. Manually refresh the browser (F5)
2. Or navigate to Dashboard manually

### Issue 6: Database Locked Error
**Problem**: SQLite database is locked  
**Solution**:
1. Close the Electron app completely
2. Restart: `npm start`
3. Try again

## How to Get Detailed Error Information

### Method 1: Browser Console
```javascript
// Open browser DevTools (F12) and run:
fetch('http://localhost:3000/seed/demo-data', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### Method 2: Backend Terminal
Check the terminal where backend is running for error messages like:
- `QueryFailedError`
- `TypeError`
- Stack traces

### Method 3: Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Click "Load Demo Data"
4. Look for `/seed/demo-data` request
5. Check Response tab for error details

## Quick Fixes

### Fix 1: Clear and Restart
```bash
# Stop all terminals (Ctrl+C)
# Then restart
npm start
```

### Fix 2: Check Token
```javascript
// In browser console
console.log(localStorage.getItem('token'));
// Should show a JWT token
// If null, you're not logged in
```

### Fix 3: Manual Database Reset
If database is corrupted:
1. Close app
2. Delete `expense-manager.db` file
3. Restart app
4. Register new account
5. Try demo data again

## What Should Happen (Success Flow)

1. Click "Load Demo Data" button
2. Confirmation dialog appears
3. Click "OK"
4. Button shows "Loading..."
5. Success message: "Demo data loaded! 10 categories, 152 expenses, 6 budgets created."
6. Page redirects to Dashboard after 2 seconds
7. Dashboard shows populated data

## Error Messages and Meanings

| Error Message | Meaning | Solution |
|---------------|---------|----------|
| "Unauthorized" | Not logged in | Login first |
| "Network Error" | Backend down | Start backend |
| "Failed to load demo data" | Generic error | Check console for details |
| "Cannot read property..." | Code error | Report the full error |
| "Database locked" | SQLite lock | Restart app |

## Still Not Working?

### Please Provide:
1. **Error message** from browser console
2. **Error message** from backend terminal
3. **Steps you took** before the error
4. **What you see** when clicking the button

### Quick Test:
Try this simpler endpoint first to see if auth works:
```javascript
// In browser console:
fetch('http://localhost:3000/categories', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
})
.then(r => r.json())
.then(console.log);
// Should return your categories
```

## Alternative: Manual Demo Data

If auto-load keeps failing, you can manually add demo data:
1. Go to Categories → Add 5-10 categories
2. Go to Expenses → Add 10-20 expenses
3. Go to Budgets → Set 2-3 budgets
4. Use Reports and Exports to test features

---

**Most Common Fix**: Make sure you're LOGGED IN before clicking "Load Demo Data"!
