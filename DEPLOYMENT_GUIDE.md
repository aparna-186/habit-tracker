# Deployment Guide: GitHub + Vercel

Follow these steps to push your code to GitHub and deploy to Vercel.

## Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in the details:
   - **Repository name**: `habit-tracker` (or your preferred name)
   - **Description**: "A beautiful gamified habit tracking app"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

## Step 2: Push Code to GitHub

After creating the repository, GitHub will show you commands. Run these in your terminal:

```bash
# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/habit-tracker.git

# Rename branch to main (if needed)
git branch -M main

# Push code to GitHub
git push -u origin main
```

**Note**: You may need to authenticate. If prompted:
- Use a Personal Access Token (not your password)
- Or use GitHub CLI: `gh auth login`

## Step 3: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in (use GitHub to sign in)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository:
   - Find `habit-tracker` in the list
   - Click **"Import"**
4. Configure the project:
   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
   - **Install Command**: `npm install` (default)
5. **Add Environment Variables**:
   Click "Environment Variables" and add these (from your `.env.local`):
   - `VITE_FIREBASE_API_KEY` = your Firebase API key
   - `VITE_FIREBASE_AUTH_DOMAIN` = your Firebase auth domain
   - `VITE_FIREBASE_PROJECT_ID` = your Firebase project ID
   - `VITE_FIREBASE_STORAGE_BUCKET` = your Firebase storage bucket
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` = your messaging sender ID
   - `VITE_FIREBASE_APP_ID` = your Firebase app ID
6. Click **"Deploy"**
7. Wait for deployment to complete (usually 1-2 minutes)
8. Your site will be live at `https://your-project-name.vercel.app`

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from your project directory)
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: habit-tracker
# - Directory: ./
# - Override settings? No
# - Add environment variables? Yes (add all Firebase env vars)
```

## Step 4: Configure Firebase for Production

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** → **General**
4. Scroll to **"Your apps"** section
5. Click on your web app → **"Add domain"**
6. Add your Vercel domain: `your-project-name.vercel.app`
7. Also add your custom domain if you have one

## Step 5: Update Firestore Security Rules (If Needed)

Make sure your Firestore security rules are set up correctly:
1. Go to Firebase Console → **Firestore Database** → **Rules**
2. Copy rules from `firestore.rules` file
3. Paste and **Publish**

## Step 6: Test Your Deployment

1. Visit your Vercel URL
2. Test sign up/sign in
3. Create a habit
4. Check in a habit
5. Verify animations and UI work correctly

## Troubleshooting

### Build Fails
- Check that all environment variables are set in Vercel
- Verify `package.json` has correct build script
- Check Vercel build logs for errors

### Firebase Errors
- Verify environment variables are correct in Vercel
- Check Firebase project settings
- Ensure Firestore rules are published
- Verify Firebase domain is added to authorized domains

### Environment Variables Not Working
- Make sure variable names start with `VITE_`
- Redeploy after adding new environment variables
- Check Vercel environment variable settings

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:
- Push to `main` branch → Production deployment
- Push to other branches → Preview deployment

## Custom Domain (Optional)

1. In Vercel dashboard, go to your project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Firebase authorized domains

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [GitHub Documentation](https://docs.github.com)
