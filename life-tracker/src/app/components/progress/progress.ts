import { Component, inject, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HabitService } from '../../services/habit';
import { CATEGORY_CONFIG, HabitCategory } from '../../models/habit.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-progress',
  imports: [DatePipe, FormsModule],
  templateUrl: './progress.html',
  styleUrl: './progress.scss',
})
export class Progress {
  habitService = inject(HabitService);
  categories = Object.entries(CATEGORY_CONFIG);
  timeRange = signal<'week' | 'month' | '3months'>('week');
  
  stats = computed(() => this.habitService.stats());
  
  chartData = computed(() => {
    const range = this.timeRange();
    const days = range === 'week' ? 7 : range === 'month' ? 30 : 90;
    const data: { date: Date; completion: number }[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date,
        completion: this.getCompletionForDate(date)
      });
    }
    return data;
  });

  categoryStats = computed(() => {
    return this.categories.map(([key, config]) => {
      const habits = this.habitService.habits().filter(h => h.category === key);
      const totalCompleted = habits.reduce((acc, h) => acc + h.completedDates.length, 0);
      const avgStreak = habits.length ? 
        Math.round(habits.reduce((acc, h) => acc + h.streak, 0) / habits.length) : 0;
      
      return {
        key,
        ...config,
        habitCount: habits.length,
        totalCompleted,
        avgStreak,
        todayProgress: this.stats().categoryBreakdown[key as HabitCategory] || 0
      };
    }).filter(c => c.habitCount > 0);
  });

  topHabits = computed(() => {
    return [...this.habitService.habits()]
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 5);
  });

  getCompletionForDate(date: Date): number {
    const dateStr = this.habitService.getDateString(date);
    const dayOfWeek = date.getDay();
    const habits = this.habitService.habits();
    const scheduled = habits.filter(h => this.habitService.isHabitScheduledForDay(h, dayOfWeek));
    if (!scheduled.length) return 0;
    const completed = scheduled.filter(h => this.habitService.isHabitCompleted(h.id, dateStr)).length;
    return Math.round((completed / scheduled.length) * 100);
  }

  getMaxCompletion(): number {
    return Math.max(...this.chartData().map(d => d.completion), 100);
  }

  setTimeRange(range: 'week' | 'month' | '3months') {
    this.timeRange.set(range);
  }
}
