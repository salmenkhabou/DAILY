import { Component, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HabitService } from '../../services/habit';
import { CATEGORY_CONFIG } from '../../models/habit.model';

@Component({
  selector: 'app-weekly-planner',
  imports: [DatePipe],
  templateUrl: './weekly-planner.html',
  styleUrl: './weekly-planner.scss',
})
export class WeeklyPlanner {
  habitService = inject(HabitService);
  categories = Object.entries(CATEGORY_CONFIG);
  today = new Date();
  
  weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  selectedDate = signal(new Date());

  weekDates = computed(() => {
    const selected = this.selectedDate();
    const startOfWeek = new Date(selected);
    startOfWeek.setDate(selected.getDate() - selected.getDay());
    
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  });

  getHabitsForDay(dayIndex: number) {
    return this.habitService.habits().filter(h => 
      this.habitService.isHabitScheduledForDay(h, dayIndex)
    );
  }

  isToday(date: Date): boolean {
    return this.habitService.getDateString(date) === this.habitService.getTodayString();
  }

  getDateString(date: Date): string {
    return this.habitService.getDateString(date);
  }

  isHabitCompleted(habitId: string, date: Date): boolean {
    return this.habitService.isHabitCompleted(habitId, this.getDateString(date));
  }

  toggleHabit(habitId: string, date: Date) {
    this.habitService.toggleHabit(habitId, this.getDateString(date));
  }

  previousWeek() {
    const newDate = new Date(this.selectedDate());
    newDate.setDate(newDate.getDate() - 7);
    this.selectedDate.set(newDate);
  }

  nextWeek() {
    const newDate = new Date(this.selectedDate());
    newDate.setDate(newDate.getDate() + 7);
    this.selectedDate.set(newDate);
  }

  goToToday() {
    this.selectedDate.set(new Date());
  }

  getDayCompletion(date: Date): number {
    const dateStr = this.getDateString(date);
    const dayOfWeek = date.getDay();
    const habits = this.habitService.habits();
    const scheduled = habits.filter(h => this.habitService.isHabitScheduledForDay(h, dayOfWeek));
    if (!scheduled.length) return 0;
    const completed = scheduled.filter(h => this.habitService.isHabitCompleted(h.id, dateStr)).length;
    return Math.round((completed / scheduled.length) * 100);
  }
}
