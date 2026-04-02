import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { Habits } from './components/habits/habits';
import { WeeklyPlanner } from './components/weekly-planner/weekly-planner';
import { Progress } from './components/progress/progress';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { authGuard, publicGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  // Protected routes
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'habits', component: Habits, canActivate: [authGuard] },
  { path: 'weekly', component: WeeklyPlanner, canActivate: [authGuard] },
  { path: 'progress', component: Progress, canActivate: [authGuard] },
  
  // Public routes
  { path: 'login', component: Login, canActivate: [publicGuard] },
  { path: 'register', component: Register, canActivate: [publicGuard] },
  
  { path: '**', redirectTo: '/dashboard' }
];
