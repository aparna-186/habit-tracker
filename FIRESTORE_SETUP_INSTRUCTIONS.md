# Firestore Security Rules Setup - REQUIRED

## ⚠️ IMPORTANT: You must set up Firestore security rules to fix permission errors!

### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com/
2. Select your project: **habit-tracker-3ce9a**
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Rules** tab

### Step 2: Copy the Rules
Open the `firestore.rules` file in this project and copy ALL its contents.

### Step 3: Paste and Publish
1. Delete any existing rules in the Firebase Console Rules editor
2. Paste the copied rules
3. Click the **Publish** button
4. Wait for confirmation (usually takes a few seconds)

### Step 4: Verify
After publishing:
- Refresh your browser
- Try signing in again
- The permission errors should be gone!

## What These Rules Do

✅ **Profiles**: Users can only access their own profile  
✅ **Habits**: Users can create and manage their own habits  
✅ **Completions**: Users can only track completions for their own habits  
✅ **Streaks**: Users can only manage streaks for their own habits  
✅ **Security**: All rules require authentication

## If You Still See Errors

1. Make sure you clicked **Publish** (not just saved)
2. Wait 10-20 seconds for rules to propagate
3. Hard refresh your browser (Ctrl+Shift+R)
4. Check that you're signed in with Firebase Auth
