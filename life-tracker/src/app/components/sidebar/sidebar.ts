import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HabitService } from '../../services/habit';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, DatePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  habitService = inject(HabitService);
  supabase = inject(SupabaseService);
  private router = inject(Router);
  today = new Date();
  
  navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/habits', label: 'Today\'s Habits', icon: '✅' },
    { path: '/weekly', label: 'Weekly Planner', icon: '📅' },
    { path: '/progress', label: 'Progress', icon: '📈' },
  ];

  async logout() {
    await this.supabase.signOut();
    this.router.navigate(['/login']);
  }
}
