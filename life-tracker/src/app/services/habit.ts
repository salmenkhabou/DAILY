import { Injectable, signal, computed, effect } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Habit, DailyLog, HabitCategory, CATEGORY_CONFIG, DEFAULT_HABITS, Stats } from '../models/habit.model';

@Injectable({
  providedIn: 'root',
})
export class HabitService {
  private habitsSignal = signal<Habit[]>([]);
  private dailyLogsSignal = signal<DailyLog[]>([]);
  private loadedSignal = signal(false);
  
  habits = this.habitsSignal.asReadonly();
  dailyLogs = this.dailyLogsSignal.asReadonly();
  loaded = this.loadedSignal.asReadonly();

  todayHabits = computed(() => {
    const dayOfWeek = new Date().getDay();
    return this.habitsSignal().filter(h => this.isHabitScheduledForDay(h, dayOfWeek));
  });

  todayProgress = computed(() => {
    const today = this.getTodayString();
    const log = this.dailyLogsSignal().find(l => l.date === today);
    const scheduled = this.todayHabits();
    if (!scheduled.length) return 0;
    const completed = scheduled.filter(h => log?.habits[h.id]).length;
    return Math.round((completed / scheduled.length) * 100);
  });

  stats = computed<Stats>(() => {
    const habits = this.habitsSignal();
    const logs = this.dailyLogsSignal();
    const today = this.getTodayString();
    const todayLog = logs.find(l => l.date === today);
    
    const completedToday = habits.filter(h => todayLog?.habits[h.id]).length;
    const currentStreak = this.calculateCurrentStreak();
    const bestStreak = Math.max(currentStreak, ...habits.map(h => h.streak));
    const weeklyCompletion = this.calculateWeeklyCompletion();
    
    const categoryBreakdown: { [key in HabitCategory]?: number } = {};
    Object.keys(CATEGORY_CONFIG).forEach(cat => {
      const catHabits = habits.filter(h => h.category === cat);
      if (catHabits.length) {
        const completed = catHabits.filter(h => todayLog?.habits[h.id]).length;
        categoryBreakdown[cat as HabitCategory] = Math.round((completed / catHabits.length) * 100);
      }
    });

    return {
      totalHabits: habits.length,
      completedToday,
      currentStreak,
      bestStreak,
      weeklyCompletion,
      categoryBreakdown
    };
  });

  constructor(private supabase: SupabaseService) {
    // React to auth changes
    effect(() => {
      const user = this.supabase.user();
      const loading = this.supabase.loading();
      if (!loading) {
        if (user) {
          this.loadUserData();
        } else {
          this.clearData();
        }
      }
    });
  }

  private async loadUserData(): Promise<void> {
    const userId = this.supabase.getUserId();
    if (!userId) return;

    try {
      // Load habits
      const { data: habits, error: habitsError } = await this.supabase.client
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at');

      if (habitsError) throw habitsError;

      if (habits && habits.length > 0) {
        this.habitsSignal.set(habits.map(this.mapDbHabitToLocal));
      } else {
        await this.initializeDefaultHabits();
      }

      // Load daily logs
      const { data: logs, error: logsError } = await this.supabase.client
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId);

      if (logsError) throw logsError;
      this.dailyLogsSignal.set(logs?.map(this.mapDbLogToLocal) || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.loadedSignal.set(true);
    }
  }

  private mapDbHabitToLocal(h: any): Habit {
    return {
      id: h.id,
      name: h.name,
      category: h.category,
      description: h.description || '',
      icon: h.icon || '✓',
      color: h.color || CATEGORY_CONFIG[h.category as HabitCategory]?.color || '#667eea',
      frequency: h.frequency || 'daily',
      targetDays: h.target_days,
      targetCount: h.target_count,
      completedDates: h.completed_dates || [],
      streak: h.streak || 0,
      createdAt: h.created_at
    };
  }

  private mapDbLogToLocal(l: any): DailyLog {
    return {
      date: l.date,
      sleepTime: l.sleep_time,
      wakeTime: l.wake_time,
      sleepQuality: l.sleep_quality,
      energyLevel: l.energy_level,
      habits: l.habits || {},
      notes: l.notes,
      mood: l.mood
    };
  }

  private clearData(): void {
    this.habitsSignal.set([]);
    this.dailyLogsSignal.set([]);
    this.loadedSignal.set(true);
  }

  private async initializeDefaultHabits(): Promise<void> {
    const userId = this.supabase.getUserId();
    if (!userId) return;

    const habits: Habit[] = DEFAULT_HABITS.map((h, i) => ({
      id: crypto.randomUUID(),
      name: h.name!,
      category: h.category!,
      description: h.description || '',
      icon: h.icon || '✓',
      color: CATEGORY_CONFIG[h.category!].color,
      frequency: h.frequency || 'daily',
      targetDays: h.targetDays,
      targetCount: h.targetCount,
      completedDates: [],
      streak: 0,
      createdAt: new Date().toISOString()
    }));

    // Insert into Supabase
    const dbHabits = habits.map(h => ({
      id: h.id,
      user_id: userId,
      name: h.name,
      category: h.category,
      description: h.description,
      icon: h.icon,
      color: h.color,
      frequency: h.frequency,
      target_days: h.targetDays,
      target_count: h.targetCount,
      completed_dates: [],
      streak: 0
    }));

    const { error } = await this.supabase.client
      .from('habits')
      .insert(dbHabits);

    if (error) {
      console.error('Error creating default habits:', error);
    }

    this.habitsSignal.set(habits);
  }

  private async saveHabitToDb(habit: Habit): Promise<void> {
    const userId = this.supabase.getUserId();
    if (!userId) return;

    const { error } = await this.supabase.client
      .from('habits')
      .upsert({
        id: habit.id,
        user_id: userId,
        name: habit.name,
        category: habit.category,
        description: habit.description,
        icon: habit.icon,
        color: habit.color,
        frequency: habit.frequency,
        target_days: habit.targetDays,
        target_count: habit.targetCount,
        completed_dates: habit.completedDates,
        streak: habit.streak
      });

    if (error) console.error('Error saving habit:', error);
  }

  private async saveLogToDb(log: DailyLog): Promise<void> {
    const userId = this.supabase.getUserId();
    if (!userId) return;

    const { error } = await this.supabase.client
      .from('daily_logs')
      .upsert({
        user_id: userId,
        date: log.date,
        sleep_time: log.sleepTime,
        wake_time: log.wakeTime,
        sleep_quality: log.sleepQuality,
        energy_level: log.energyLevel,
        habits: log.habits,
        notes: log.notes,
        mood: log.mood
      }, { onConflict: 'user_id,date' });

    if (error) console.error('Error saving log:', error);
  }

  getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  getDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  isHabitScheduledForDay(habit: Habit, dayOfWeek: number): boolean {
    if (habit.frequency === 'daily') return true;
    if (habit.frequency === 'weekly') return dayOfWeek === 0;
    if (habit.targetDays?.length) return habit.targetDays.includes(dayOfWeek);
    return true;
  }

  async toggleHabit(habitId: string, date?: string): Promise<void> {
    const targetDate = date || this.getTodayString();
    const logs = [...this.dailyLogsSignal()];
    let log = logs.find(l => l.date === targetDate);
    
    if (!log) {
      log = { date: targetDate, habits: {} };
      logs.push(log);
    }
    
    log.habits[habitId] = !log.habits[habitId];
    
    const habits = this.habitsSignal().map(h => {
      if (h.id === habitId) {
        const completedDates = log!.habits[habitId]
          ? [...new Set([...h.completedDates, targetDate])]
          : h.completedDates.filter(d => d !== targetDate);
        return { ...h, completedDates, streak: this.calculateHabitStreak(completedDates) };
      }
      return h;
    });
    
    this.habitsSignal.set(habits);
    this.dailyLogsSignal.set(logs);

    // Save to DB
    const updatedHabit = habits.find(h => h.id === habitId);
    if (updatedHabit) await this.saveHabitToDb(updatedHabit);
    await this.saveLogToDb(log);
  }

  isHabitCompleted(habitId: string, date?: string): boolean {
    const targetDate = date || this.getTodayString();
    const log = this.dailyLogsSignal().find(l => l.date === targetDate);
    return log?.habits[habitId] || false;
  }

  private calculateHabitStreak(completedDates: string[]): number {
    if (!completedDates.length) return 0;
    const sorted = [...completedDates].sort().reverse();
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i <= sorted.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = this.getDateString(checkDate);
      if (sorted.includes(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }

  private calculateCurrentStreak(): number {
    const logs = this.dailyLogsSignal();
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = this.getDateString(checkDate);
      const log = logs.find(l => l.date === dateStr);
      
      if (log && Object.values(log.habits).some(v => v)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }

  private calculateWeeklyCompletion(): number {
    const logs = this.dailyLogsSignal();
    const habits = this.habitsSignal();
    const today = new Date();
    let totalScheduled = 0;
    let totalCompleted = 0;
    
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = this.getDateString(checkDate);
      const dayOfWeek = checkDate.getDay();
      const log = logs.find(l => l.date === dateStr);
      
      const scheduledHabits = habits.filter(h => this.isHabitScheduledForDay(h, dayOfWeek));
      totalScheduled += scheduledHabits.length;
      totalCompleted += scheduledHabits.filter(h => log?.habits[h.id]).length;
    }
    
    return totalScheduled ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
  }

  async addHabit(habit: Partial<Habit>): Promise<void> {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: habit.name || 'New Habit',
      category: habit.category || 'morning',
      description: habit.description || '',
      icon: habit.icon || '✓',
      color: CATEGORY_CONFIG[habit.category || 'morning'].color,
      frequency: habit.frequency || 'daily',
      targetDays: habit.targetDays,
      targetCount: habit.targetCount,
      completedDates: [],
      streak: 0,
      createdAt: new Date().toISOString()
    };
    this.habitsSignal.update(habits => [...habits, newHabit]);
    await this.saveHabitToDb(newHabit);
  }

  async updateHabit(id: string, updates: Partial<Habit>): Promise<void> {
    let updatedHabit: Habit | undefined;
    this.habitsSignal.update(habits => 
      habits.map(h => {
        if (h.id === id) {
          updatedHabit = { ...h, ...updates };
          return updatedHabit;
        }
        return h;
      })
    );
    if (updatedHabit) await this.saveHabitToDb(updatedHabit);
  }

  async deleteHabit(id: string): Promise<void> {
    this.habitsSignal.update(habits => habits.filter(h => h.id !== id));
    
    const userId = this.supabase.getUserId();
    if (userId) {
      await this.supabase.client
        .from('habits')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
    }
  }

  getHabitsByCategory(category: HabitCategory): Habit[] {
    return this.habitsSignal().filter(h => h.category === category);
  }

  async updateDailyLog(date: string, updates: Partial<DailyLog>): Promise<void> {
    const logs = [...this.dailyLogsSignal()];
    const index = logs.findIndex(l => l.date === date);
    let log: DailyLog;
    
    if (index >= 0) {
      log = { ...logs[index], ...updates };
      logs[index] = log;
    } else {
      log = { date, habits: {}, ...updates };
      logs.push(log);
    }
    
    this.dailyLogsSignal.set(logs);
    await this.saveLogToDb(log);
  }

  getDailyLog(date: string): DailyLog | undefined {
    return this.dailyLogsSignal().find(l => l.date === date);
  }

  getWeekDates(): Date[] {
    const today = new Date();
    const dates: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    return dates;
  }

  async resetAllData(): Promise<void> {
    const userId = this.supabase.getUserId();
    if (userId) {
      await this.supabase.client.from('habits').delete().eq('user_id', userId);
      await this.supabase.client.from('daily_logs').delete().eq('user_id', userId);
    }
    await this.initializeDefaultHabits();
    this.dailyLogsSignal.set([]);
  }
}
