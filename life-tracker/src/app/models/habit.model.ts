export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  description: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'custom';
  targetDays?: number[];
  targetCount?: number;
  completedDates: string[];
  streak: number;
  createdAt: string;
}

export type HabitCategory = 
  | 'sleep'
  | 'gym'
  | 'study'
  | 'startup'
  | 'trading'
  | 'relationships'
  | 'morning'
  | 'mental'
  | 'digital';

export interface DailyLog {
  date: string;
  sleepTime?: string;
  wakeTime?: string;
  sleepQuality?: number;
  energyLevel?: number;
  habits: { [habitId: string]: boolean };
  notes?: string;
  mood?: 'great' | 'good' | 'okay' | 'low' | 'bad';
}

export interface WeeklyGoal {
  id: string;
  category: HabitCategory;
  title: string;
  target: number;
  current: number;
  weekStart: string;
}

export interface Stats {
  totalHabits: number;
  completedToday: number;
  currentStreak: number;
  bestStreak: number;
  weeklyCompletion: number;
  categoryBreakdown: { [key in HabitCategory]?: number };
}

export const CATEGORY_CONFIG: { [key in HabitCategory]: { label: string; icon: string; color: string } } = {
  sleep: { label: 'Sleep', icon: '🌙', color: '#6366f1' },
  gym: { label: 'Gym', icon: '💪', color: '#ef4444' },
  study: { label: 'Study', icon: '📚', color: '#f59e0b' },
  startup: { label: 'Startup', icon: '🚀', color: '#10b981' },
  trading: { label: 'Trading', icon: '📈', color: '#3b82f6' },
  relationships: { label: 'Relationships', icon: '❤️', color: '#ec4899' },
  morning: { label: 'Morning', icon: '☀️', color: '#fbbf24' },
  mental: { label: 'Mental', icon: '🧠', color: '#8b5cf6' },
  digital: { label: 'Digital Wellness', icon: '📱', color: '#06b6d4' }
};

export const DEFAULT_HABITS: Partial<Habit>[] = [
  { name: 'Sleep by 11 PM', category: 'sleep', description: 'Get to bed by 11:00 PM', icon: '🛏️', frequency: 'daily' },
  { name: 'Wake at 7 AM', category: 'sleep', description: 'Wake up at 7:00 AM consistently', icon: '⏰', frequency: 'daily' },
  { name: 'No phone in bed', category: 'sleep', description: 'Keep phone away from bed', icon: '📵', frequency: 'daily' },
  { name: 'Drink water', category: 'morning', description: 'Drink water first thing', icon: '💧', frequency: 'daily' },
  { name: 'Make bed', category: 'morning', description: 'Make bed immediately', icon: '🛏️', frequency: 'daily' },
  { name: 'Morning movement', category: 'morning', description: '3-5 min of movement', icon: '🏃', frequency: 'daily' },
  { name: 'Write top 3 priorities', category: 'morning', description: 'Plan the day ahead', icon: '📝', frequency: 'daily' },
  { name: 'No social media first', category: 'morning', description: 'Avoid social media in morning', icon: '🚫', frequency: 'daily' },
  { name: 'Upper body workout', category: 'gym', description: 'Complete upper body session', icon: '💪', frequency: 'custom', targetDays: [1, 3] },
  { name: 'Lower body workout', category: 'gym', description: 'Complete lower body session', icon: '🦵', frequency: 'custom', targetDays: [2, 6] },
  { name: 'Same-day review', category: 'study', description: '20-40 min review after class', icon: '📖', frequency: 'daily' },
  { name: 'Deep study block', category: 'study', description: '45-90 min focused study', icon: '🎯', frequency: 'custom', targetCount: 4 },
  { name: 'Weekly academic reset', category: 'study', description: 'Plan and review week', icon: '📋', frequency: 'custom', targetDays: [0] },
  { name: 'Startup School session', category: 'startup', description: 'YC Startup School lesson', icon: '🎓', frequency: 'custom', targetCount: 2 },
  { name: 'Startup podcast', category: 'startup', description: 'Listen to startup podcast', icon: '🎧', frequency: 'custom', targetCount: 4 },
  { name: 'Founder notebook entry', category: 'startup', description: 'Document lessons learned', icon: '📓', frequency: 'custom', targetCount: 2 },
  { name: 'Trading education', category: 'trading', description: 'Max 45 min study session', icon: '📊', frequency: 'custom', targetCount: 2 },
  { name: 'Trading journal', category: 'trading', description: 'Journal what you learned', icon: '✍️', frequency: 'custom', targetCount: 2 },
  { name: 'Girlfriend time', category: 'relationships', description: 'Meaningful quality time', icon: '💑', frequency: 'custom', targetCount: 1 },
  { name: 'Friend hangout', category: 'relationships', description: 'Social time with friends', icon: '👥', frequency: 'custom', targetCount: 1 },
  { name: 'Family contact', category: 'relationships', description: 'Daily check-in with family', icon: '👨‍👩‍👧', frequency: 'daily' },
  { name: 'Nightly review', category: 'mental', description: '10 min reflection on day', icon: '🌅', frequency: 'daily' },
  { name: 'Quiet moment', category: 'mental', description: 'Prayer/meditation/reflection', icon: '🧘', frequency: 'daily' },
  { name: 'Notifications off', category: 'digital', description: 'Keep non-essential notifications off', icon: '🔕', frequency: 'daily' },
  { name: 'No random scrolling', category: 'digital', description: 'Avoid mindless browsing', icon: '📵', frequency: 'daily' },
];
