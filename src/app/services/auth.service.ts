import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { environment } from '../../environments/environment';

export interface AppUser {
  id: string;
  full_name: string;
  email: string;
  role: 'guest' | 'host' | 'admin';
  avatar_url?: string;
  phone?: string;
  businessName?: string;
}

interface MockUser extends AppUser { password: string; }
const MOCK_USERS_KEY = 'tripmate_mock_users';
const MOCK_SESSION_KEY = 'tripmate_mock_session';

export type AuthState = AppUser | null | 'loading';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _state = new BehaviorSubject<AuthState>('loading');
  currentUser$ = this._state.asObservable();

  get currentUser(): AppUser | null {
    const v = this._state.value;
    return v === 'loading' ? null : v;
  }

  constructor(private supabase: SupabaseService, private router: Router, private ngZone: NgZone) {
    this.initAuth();
  }

  private initAuth() {
    if (environment.USE_MOCK_DATA) {
      const stored = localStorage.getItem(MOCK_SESSION_KEY);
      try {
        this.ngZone.run(() => this._state.next(stored ? JSON.parse(stored) : null));
      } catch {
        this.ngZone.run(() => this._state.next(null));
      }
      return;
    }

    this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthService] onAuthStateChange:', event, session?.user?.id ?? 'no user');

      if (session?.user) {
        const profile = await this.fetchProfile(session.user.id);
        const appUser: AppUser = profile || {
          id: session.user.id,
          full_name: (session.user.user_metadata?.['full_name'] as string) || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: (session.user.user_metadata?.['role'] as any) || 'guest',
          avatar_url: (session.user.user_metadata?.['avatar_url'] as string) || undefined,
        };
        this.ngZone.run(() => this._state.next(appUser));
      } else {
        this.ngZone.run(() => this._state.next(null));
      }
    });

    setTimeout(() => {
      if (this._state.value === 'loading') {
        console.warn('[AuthService] Session check timed out after 3s, forcing logged-out state');
        this.ngZone.run(() => this._state.next(null));
      }
    }, 3000);
  }

  private async fetchProfile(userId: string): Promise<AppUser | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('id, full_name, email, role, avatar_url, phone')
        .eq('id', userId)
        .single();
      if (error || !data) return null;
      return data as AppUser;
    } catch (e) {
      console.error('[AuthService] fetchProfile error:', e);
      return null;
    }
  }

  async signUp(payload: {
    full_name: string; email: string; password: string;
    role: 'guest' | 'host'; businessName?: string;
  }): Promise<AppUser> {
    if (environment.USE_MOCK_DATA) {
      const existing = this.getMockUsers().find(u => u.email === payload.email);
      if (existing) throw new Error('An account with this email already exists.');
      const newUser: MockUser = {
        id: 'mock_' + Date.now(), full_name: payload.full_name,
        email: payload.email, password: payload.password,
        role: payload.role, businessName: payload.businessName,
      };
      this.saveMockUser(newUser);
      const { password: _pw, ...safe } = newUser;
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(safe));
      this.ngZone.run(() => this._state.next(safe));
      return safe;
    }

    const { data, error } = await this.supabase.auth.signUp({
      email: payload.email, password: payload.password,
      options: { data: { full_name: payload.full_name, role: payload.role } },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Signup failed.');

    const profile = await this.fetchProfile(data.user.id);
    const appUser: AppUser = profile || {
      id: data.user.id,
      full_name: payload.full_name,
      email: payload.email,
      role: payload.role,
      businessName: payload.businessName,
    };
    this.ngZone.run(() => this._state.next(appUser));
    return appUser;
  }

  async signIn(email: string, password: string): Promise<AppUser> {
    if (environment.USE_MOCK_DATA) {
      const user = this.getMockUsers().find(u => u.email === email && u.password === password);
      if (!user) throw new Error('Invalid email or password.');
      const { password: _pw, ...safe } = user;
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(safe));
      this.ngZone.run(() => this._state.next(safe));
      return safe;
    }

    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Login failed.');

    const profile = await this.fetchProfile(data.user.id);
    const appUser: AppUser = profile || {
      id: data.user.id,
      full_name: (data.user.user_metadata?.['full_name'] as string) || data.user.email?.split('@')[0] || 'User',
      email: data.user.email || email,
      role: (data.user.user_metadata?.['role'] as any) || 'guest',
      avatar_url: (data.user.user_metadata?.['avatar_url'] as string) || undefined,
    };
    this.ngZone.run(() => this._state.next(appUser));
    return appUser;
  }

  async updateProfile(updates: Partial<AppUser>) {
    const user = this.currentUser;
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    if (environment.USE_MOCK_DATA) {
      const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
      const idx = users.findIndex((u: any) => u.id === user.id);
      if (idx !== -1) { users[idx] = { ...users[idx], ...updates }; localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users)); }
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(updatedUser));
      this.ngZone.run(() => this._state.next(updatedUser));
      return;
    }
    await this.supabase.client.from('profiles').update(updates).eq('id', user.id);
    this.ngZone.run(() => this._state.next(updatedUser));
  }

  async signOut() {
    if (environment.USE_MOCK_DATA) {
      localStorage.removeItem(MOCK_SESSION_KEY);
      this.ngZone.run(() => this._state.next(null));
      this.router.navigateByUrl('/homepage');
      return;
    }
    await this.supabase.auth.signOut();
    this.ngZone.run(() => this._state.next(null));
    this.router.navigateByUrl('/homepage');
  }

  isLoggedIn(): boolean { return !!this.currentUser; }
  isHost(): boolean { return this.currentUser?.role === 'host'; }
  getCurrentUser(): AppUser | null { return this.currentUser; }

  async register(payload: any): Promise<AppUser> {
    return this.signUp({ full_name: payload.name, email: payload.email, password: payload.password, role: payload.role || 'guest', businessName: payload.businessName });
  }
  async login(payload: any): Promise<AppUser> {
    return this.signIn(payload.email || payload.identifier, payload.password);
  }

  private getMockUsers(): MockUser[] {
    try { return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]'); } catch { return []; }
  }
  private saveMockUser(user: MockUser) {
    const users = this.getMockUsers(); users.push(user); localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  }
}