import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface Expense {
  id: string;
  user_id?: string;
  itinerary_id: string;
  category: 'Accommodation' | 'Food' | 'Transport' | 'Activities' | 'Shopping' | 'Other';
  amount: number;
  description?: string;
  date: string;
  created_at?: string;
}

export interface BudgetSummary {
  total_budget: number;
  total_spent: number;
  remaining: number;
  by_category: Record<string, number>;
}

const MOCK_EXPENSES_KEY = 'tripmate_mock_expenses';
const TRIP_BUDGET_KEY = 'tripmate_trip_budget';
const DEFAULT_BUDGET = 25000;

const MOCK_EXPENSES_SEED: Expense[] = [
  { id: 'exp-1', itinerary_id: 'itin-1', category: 'Accommodation', amount: 8500, description: 'Kubo Homestay', date: '2026-10-12' },
  { id: 'exp-2', itinerary_id: 'itin-1', category: 'Transport', amount: 5000, description: 'Flight to Palawan', date: '2026-10-11' },
  { id: 'exp-3', itinerary_id: 'itin-1', category: 'Food', amount: 3500, description: 'Seafood Dinner & Artcafe', date: '2026-10-12' },
  { id: 'exp-4', itinerary_id: 'itin-1', category: 'Activities', amount: 1500, description: 'Tour A Island Hopping', date: '2026-10-13' },
];

@Injectable({ providedIn: 'root' })
export class BudgetService {
  constructor(private supabase: SupabaseService, private auth: AuthService) {}

  private getUserKey(): string {
    const user = this.auth.getCurrentUser();
    if (user?.id) return user.id;

    try {
      const stored = localStorage.getItem('tripmate_mock_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id) return parsed.id;
      }
    } catch {}

    return 'guest';
  }

  private getExpensesKey(): string {
    return `${MOCK_EXPENSES_KEY}_${this.getUserKey()}`;
  }

  private getBudgetKey(): string {
    return `${TRIP_BUDGET_KEY}_${this.getUserKey()}`;
  }

  private getMockExpenses(): Expense[] {
    const key = this.getExpensesKey();
    const userKey = this.getUserKey();
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored);
      }
      // For unauthenticated guest, provide demo seed data.
      // For newly created or authenticated user accounts, start with empty expenses.
      if (userKey === 'guest') {
        const seed = JSON.parse(JSON.stringify(MOCK_EXPENSES_SEED));
        this.saveMockExpenses(seed);
        return seed;
      } else {
        const empty: Expense[] = [];
        this.saveMockExpenses(empty);
        return empty;
      }
    } catch {
      return [];
    }
  }

  private saveMockExpenses(expenses: Expense[]) {
    try {
      localStorage.setItem(this.getExpensesKey(), JSON.stringify(expenses));
    } catch (e) {
      console.warn('Failed to save expenses to localStorage:', e);
    }
  }

  getTripBudget(): number {
    const key = this.getBudgetKey();
    const userKey = this.getUserKey();
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        const parsed = Number(saved);
        if (!isNaN(parsed) && parsed >= 0) return parsed;
      }
      // Guest defaults to demo budget, whereas registered accounts start with 0 (no budget set yet)
      return userKey === 'guest' ? DEFAULT_BUDGET : 0;
    } catch {
      return 0;
    }
  }

  setTripBudget(amount: number): void {
    try {
      localStorage.setItem(this.getBudgetKey(), amount.toString());
    } catch (e) {
      console.warn('Failed to save budget to localStorage:', e);
    }
  }

  getLocalExpenses(): Expense[] {
    return this.getMockExpenses();
  }

  async getExpensesByItinerary(itineraryId: string = 'itin-1'): Promise<Expense[]> {
    if (environment.USE_MOCK_DATA) {
      return this.getMockExpenses();
    }

    const user = this.auth.getCurrentUser();
    if (!user) {
      return this.getMockExpenses();
    }

    try {
      const { data, error } = await this.supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error || !data || data.length === 0) {
        // Fallback to user-scoped local storage records
        return this.getMockExpenses();
      }
      this.saveMockExpenses(data);
      return data;
    } catch (err) {
      return this.getMockExpenses();
    }
  }

  async addExpense(expense: Partial<Expense>): Promise<Expense | null> {
    const user = this.auth.getCurrentUser();
    const n: Expense = {
      id: expense.id || ('exp-' + Date.now()),
      user_id: user?.id,
      itinerary_id: expense.itinerary_id || 'itin-1',
      category: expense.category || 'Other',
      amount: Number(expense.amount) || 0,
      description: expense.description || 'Expense',
      date: expense.date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    const all = this.getMockExpenses();
    // Prevent duplicate in local array if already present
    const existingIndex = all.findIndex(e => e.id === n.id);
    if (existingIndex !== -1) {
      all[existingIndex] = n;
    } else {
      all.push(n);
    }
    this.saveMockExpenses(all);

    if (!environment.USE_MOCK_DATA && user) {
      try {
        const { data, error } = await this.supabase
          .from('expenses')
          .insert({
            user_id: user.id,
            itinerary_id: n.itinerary_id,
            category: n.category,
            amount: n.amount,
            description: n.description,
            date: n.date
          })
          .select()
          .single();

        if (data?.id) {
          const oldId = n.id;
          n.id = data.id;
          const current = this.getMockExpenses();
          const matchIdx = current.findIndex(e => e.id === oldId);
          if (matchIdx !== -1) {
            current[matchIdx].id = data.id;
            this.saveMockExpenses(current);
          }
        }
      } catch (err) {
        console.warn('Supabase addExpense sync notice:', err);
      }
    }
    return n;
  }

  async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<Expense | null> {
    const all = this.getMockExpenses();
    const idx = all.findIndex(e => e.id === expenseId);
    let updated: Expense | null = null;
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updates, amount: Number(updates.amount ?? all[idx].amount) };
      updated = all[idx];
      this.saveMockExpenses(all);
    }

    const user = this.auth.getCurrentUser();
    if (!environment.USE_MOCK_DATA && user) {
      try {
        await this.supabase
          .from('expenses')
          .update(updates)
          .eq('id', expenseId)
          .eq('user_id', user.id);
      } catch (err) {
        console.warn('Supabase updateExpense sync notice:', err);
      }
    }
    return updated;
  }

  async deleteExpense(expenseId: string): Promise<void> {
    const all = this.getMockExpenses().filter(e => e.id !== expenseId);
    this.saveMockExpenses(all);

    const user = this.auth.getCurrentUser();
    if (!environment.USE_MOCK_DATA && user) {
      try {
        await this.supabase
          .from('expenses')
          .delete()
          .eq('id', expenseId)
          .eq('user_id', user.id);
      } catch (err) {
        console.warn('Supabase deleteExpense sync notice:', err);
      }
    }
  }

  async getBudgetSummary(itineraryId: string = 'itin-1', totalBudget?: number): Promise<BudgetSummary> {
    const expenses = await this.getExpensesByItinerary(itineraryId);
    const budget = totalBudget ?? this.getTripBudget();
    const by_category: Record<string, number> = {};
    let total_spent = 0;

    for (const e of expenses) {
      const amt = Number(e.amount) || 0;
      total_spent += amt;
      by_category[e.category] = (by_category[e.category] || 0) + amt;
    }

    return {
      total_budget: budget,
      total_spent,
      remaining: budget - total_spent,
      by_category,
    };
  }
}
