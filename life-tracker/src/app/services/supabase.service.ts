import { Injectable, signal, computed } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  
  private userSignal = signal<User | null>(null);
  private sessionSignal = signal<Session | null>(null);
  private loadingSignal = signal(true);

  user = this.userSignal.asReadonly();
  session = this.sessionSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  
  isAuthenticated = computed(() => !!this.userSignal());

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.initSession();
  }

  private async initSession() {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      this.sessionSignal.set(session);
      this.userSignal.set(session?.user ?? null);
      
      this.supabase.auth.onAuthStateChange((_event, session) => {
        this.sessionSignal.set(session);
        this.userSignal.set(session?.user ?? null);
      });
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  getUserId(): string | null {
    return this.userSignal()?.id ?? null;
  }

  getUserName(): string {
    const user = this.userSignal();
    return user?.user_metadata?.['full_name'] || user?.email?.split('@')[0] || 'User';
  }
}
