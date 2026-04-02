import { Component, inject, signal } from '@angular/core';
import { HabitService } from '../../services/habit';
import { HabitCategory, CATEGORY_CONFIG, Habit } from '../../models/habit.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-habits',
  imports: [FormsModule],
  templateUrl: './habits.html',
  styleUrl: './habits.scss',
})
export class Habits {
  habitService = inject(HabitService);
  categories = Object.entries(CATEGORY_CONFIG);
  selectedCategory = signal<string | null>(null);
  showAddModal = signal(false);
  
  newHabit = {
    name: '',
    description: '',
    category: 'morning' as HabitCategory,
    frequency: 'daily' as 'daily' | 'weekly' | 'custom',
    icon: '✓'
  };

  get filteredHabits() {
    const todayHabits = this.habitService.todayHabits();
    const cat = this.selectedCategory();
    return cat ? todayHabits.filter(h => h.category === cat) : todayHabits;
  }

  selectCategory(cat: string | null) {
    this.selectedCategory.set(cat === this.selectedCategory() ? null : cat);
  }

  toggleHabit(habit: Habit) {
    this.habitService.toggleHabit(habit.id);
  }

  isCompleted(habit: Habit): boolean {
    return this.habitService.isHabitCompleted(habit.id);
  }

  openAddModal() {
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
    this.resetNewHabit();
  }

  resetNewHabit() {
    this.newHabit = {
      name: '',
      description: '',
      category: 'morning',
      frequency: 'daily',
      icon: '✓'
    };
  }

  addHabit() {
    if (this.newHabit.name.trim()) {
      this.habitService.addHabit(this.newHabit);
      this.closeAddModal();
    }
  }

  deleteHabit(id: string, event: Event) {
    event.stopPropagation();
    if (confirm('Delete this habit?')) {
      this.habitService.deleteHabit(id);
    }
  }
}
