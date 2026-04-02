import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  // Wait for auth to initialize
  while (supabase.loading()) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  if (supabase.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

export const publicGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  // Wait for auth to initialize
  while (supabase.loading()) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  if (!supabase.isAuthenticated()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
