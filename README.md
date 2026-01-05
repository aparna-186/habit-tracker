# Habit Tracker 🎯

A beautiful, gamified habit tracking web application built with React, TypeScript, Firebase, and Framer Motion.

## Features

- ✨ **Animated Gradient Background** - Smooth flowing blob animations
- 🎮 **Gamification System** - Earn XP, level up, and unlock badges
- 🔥 **Streak Tracking** - Build and maintain daily streaks
- 📊 **Progress Dashboard** - Visual stats and progress tracking
- 🎨 **Modern UI** - Beautiful glassmorphism design with smooth animations
- 💾 **Firebase Integration** - Real-time data sync with Firestore
- 🔐 **Authentication** - Secure user authentication with Firebase Auth

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Firebase** - Backend (Auth + Firestore)
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **React Router** - Navigation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication and Firestore enabled

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd habit-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Set up Firestore Security Rules:
   - Go to Firebase Console → Firestore Database → Rules
   - Copy the rules from `firestore.rules` file
   - Paste and publish in Firebase Console

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables in Vercel dashboard:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
6. Click "Deploy"

## Project Structure

```
habit-tracker/
├── src/
│   ├── components/     # Reusable components
│   ├── contexts/       # React contexts (Auth)
│   ├── lib/           # Utilities and Firebase config
│   ├── pages/         # Page components
│   └── main.tsx       # Entry point
├── firestore.rules    # Firestore security rules
└── package.json
```

## License

MIT
