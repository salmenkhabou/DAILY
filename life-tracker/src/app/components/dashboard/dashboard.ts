import { Component, inject, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HabitService } from '../../services/habit';
import { SupabaseService } from '../../services/supabase.service';
import { CATEGORY_CONFIG, HabitCategory } from '../../models/habit.model';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  habitService = inject(HabitService);
  supabase = inject(SupabaseService);
  today = new Date();
  categories = Object.entries(CATEGORY_CONFIG);

  weekDates = computed(() => this.habitService.getWeekDates());
  
  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  });

  userName = computed(() => this.supabase.getUserName());

  getCompletionForDate(date: Date): number {
    const dateStr = this.habitService.getDateString(date);
    const dayOfWeek = date.getDay();
    const habits = this.habitService.habits();
    const scheduled = habits.filter(h => this.habitService.isHabitScheduledForDay(h, dayOfWeek));
    if (!scheduled.length) return 0;
    const completed = scheduled.filter(h => this.habitService.isHabitCompleted(h.id, dateStr)).length;
    return Math.round((completed / scheduled.length) * 100);
  }

  getCategoryProgress(category: string): number {
    return this.habitService.stats().categoryBreakdown[category as HabitCategory] || 0;
  }

  getUpcomingHabits() {
    const todayHabits = this.habitService.todayHabits();
    return todayHabits.filter(h => !this.habitService.isHabitCompleted(h.id)).slice(0, 5);
  }
}
