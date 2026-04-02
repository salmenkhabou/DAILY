# 🎯 LifeTracker - Habit Tracking App

A professional Angular application for tracking daily habits, building routines, and becoming the best version of yourself.

## ✨ Features

- **📊 Dashboard** - Overview of progress with charts and stats
- **✅ Daily Habits** - Track all your habits with completion status
- **📅 Weekly Planner** - Plan and track habits across the week
- **📈 Progress Analytics** - Detailed insights and trend analysis
- **👤 Multi-user Support** - Each user has their own data
- **☁️ Cloud Sync** - Data synced via Supabase

## 🚀 Quick Start

### 1. Supabase Setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your project → SQL Editor → New Query
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the query to create tables

### 2. Configure Environment

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://gvmxfwraryjefetbohmi.supabase.co',
  supabaseKey: 'YOUR_ANON_KEY_HERE' // Get from Supabase → Settings → API → anon public
};
```

**To find your anon key:**
- Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

### 3. Install & Run

```bash
npm install
ng serve --open
```

## 📋 Pre-loaded Habits (25 total)

The app comes with habits based on the life strategy:

- **🌙 Sleep**: Sleep by 11 PM, Wake at 7 AM, No phone in bed
- **☀️ Morning**: Water, Make bed, Movement, Top 3 priorities, No social media
- **💪 Gym**: Upper body (Mon/Wed), Lower body (Tue/Sat)
- **📚 Study**: Same-day review, Deep study blocks, Weekly reset
- **🚀 Startup**: Startup School, Podcasts, Founder notebook
- **📈 Trading**: Trading education, Trading journal
- **❤️ Relationships**: Girlfriend time, Friend hangout, Family contact
- **🧠 Mental**: Nightly review, Quiet moment
- **📱 Digital**: Notifications off, No random scrolling

## 🛠️ Tech Stack

- Angular 21 with standalone components
- Signals for reactive state
- Supabase for auth & database
- SCSS with modern glassmorphism design
- Fully responsive

## 📁 Project Structure

```
src/app/
├── components/
│   ├── auth/           # Login & Register
│   ├── dashboard/      # Main dashboard
│   ├── habits/         # Today's habits
│   ├── weekly-planner/ # Week view
│   ├── progress/       # Analytics
│   └── sidebar/        # Navigation
├── services/
│   ├── habit.ts        # Habit management
│   ├── supabase.service.ts # Auth & DB
│   └── storage.ts      # Local storage
├── models/
│   └── habit.model.ts  # Types & defaults
└── guards/
    └── auth.guard.ts   # Route protection
```

## 🔐 Authentication

- Email/password signup with confirmation
- Secure session management
- Row Level Security (RLS) on database

## 📦 Building for Production

```bash
ng build --configuration production
```

Output will be in `dist/life-tracker/`

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ for building better habits
