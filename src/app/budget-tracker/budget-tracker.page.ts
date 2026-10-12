import { Component, OnInit, HostListener, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonMenuButton,
  IonButtons,
  IonButton,
  IonIcon,
  AlertController,
  ToastController
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import {
  addOutline,
  walletOutline,
  cardOutline,
  cashOutline,
  bedOutline,
  airplaneOutline,
  restaurantOutline,
  mapOutline,
  createOutline,
  trashOutline,
  closeOutline,
  checkmarkOutline,
  bagHandleOutline,
  receiptOutline,
  pieChartOutline
} from 'ionicons/icons';

import { BudgetService, Expense } from '../services/budget.service';
import { AuthService } from '../services/auth.service';

export interface CategoryBreakdownItem {
  name: 'Accommodation' | 'Food' | 'Transport' | 'Activities' | 'Shopping' | 'Other';
  amount: number;
  percentOfSpent: number;
  icon: string;
  colorClass: string;
  barClass: string;
}

@Component({
  selector: 'app-budget-tracker',
  templateUrl: './budget-tracker.page.html',
  styleUrls: ['./budget-tracker.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonMenuButton,
    IonButtons,
    IonButton,
    IonIcon
  ]
})
export class BudgetTrackerPage implements OnInit {
  private budgetService = inject(BudgetService);
  private auth = inject(AuthService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  expenses: Expense[] = [];
  displayedExpenses: Expense[] = [];
  isShowingAll: boolean = false;

  totalBudget: number = 0;
  totalSpent: number = 0;
  remainingBudget: number = 0;
  spentPercentage: number = 0;
  remainingPercentage: number = 0;

  categoryBreakdown: CategoryBreakdownItem[] = [];

  // Expense Modal State
  isExpenseModalOpen: boolean = false;
  isEditingExpense: boolean = false;
  expenseModalTitle: string = 'Add Expense';
  expenseForm = {
    id: '',
    description: '',
    category: 'Accommodation' as Expense['category'],
    amount: null as number | null,
    date: new Date().toISOString().split('T')[0]
  };

  // Budget Modal State
  isBudgetModalOpen: boolean = false;
  budgetInput: number | null = null;

  readonly categoriesList: Expense['category'][] = [
    'Accommodation',
    'Transport',
    'Food',
    'Activities',
    'Shopping',
    'Other'
  ];

  constructor() {
    addIcons({
      addOutline,
      walletOutline,
      cardOutline,
      cashOutline,
      bedOutline,
      airplaneOutline,
      restaurantOutline,
      mapOutline,
      createOutline,
      trashOutline,
      closeOutline,
      checkmarkOutline,
      bagHandleOutline,
      receiptOutline,
      pieChartOutline
    });
  }

  async ngOnInit() {
    // 1. Instantly load local data synchronously
    this.syncFromLocal();
    // 2. Fetch latest data in background
    await this.loadBudgetData();

    // 3. Automatically refresh budget tracker whenever user logs in, signs up, or switches accounts
    this.auth.currentUser$.subscribe(() => {
      this.syncFromLocal();
      this.loadBudgetData();
    });
  }

  async ionViewWillEnter() {
    this.syncFromLocal();
    await this.loadBudgetData();
  }

  private syncFromLocal() {
    this.totalBudget = this.budgetService.getTripBudget();
    this.expenses = this.budgetService.getLocalExpenses();
    this.calculateMetrics();
    this.updateDisplayedExpenses();
    this.cdr.detectChanges();
  }

  async loadBudgetData() {
    this.totalBudget = this.budgetService.getTripBudget();
    try {
      const exps = await this.budgetService.getExpensesByItinerary('itin-1');
      this.ngZone.run(() => {
        this.expenses = exps || [];
        this.calculateMetrics();
        this.updateDisplayedExpenses();
        this.cdr.detectChanges();
      });
    } catch {
      this.ngZone.run(() => {
        this.calculateMetrics();
        this.updateDisplayedExpenses();
        this.cdr.detectChanges();
      });
    }
  }

  calculateMetrics() {
    let spent = 0;
    const catMap: Record<string, number> = {
      Accommodation: 0,
      Transport: 0,
      Food: 0,
      Activities: 0,
      Shopping: 0,
      Other: 0
    };

    for (const exp of this.expenses) {
      const amt = Number(exp.amount) || 0;
      spent += amt;
      catMap[exp.category] = (catMap[exp.category] || 0) + amt;
    }

    this.totalSpent = spent;
    this.remainingBudget = this.totalBudget - this.totalSpent;

    if (this.totalBudget > 0) {
      this.spentPercentage = Math.round((this.totalSpent / this.totalBudget) * 100);
      this.remainingPercentage = Math.max(0, 100 - this.spentPercentage);
    } else {
      this.spentPercentage = this.totalSpent > 0 ? 100 : 0;
      this.remainingPercentage = 0;
    }

    // Build categories list
    const allCategories: CategoryBreakdownItem[] = [
      {
        name: 'Accommodation',
        amount: catMap['Accommodation'],
        percentOfSpent: this.calcCategoryPercent(catMap['Accommodation'], spent),
        icon: 'bed-outline',
        colorClass: 'accommodation',
        barClass: 'accommodation-bar'
      },
      {
        name: 'Transport',
        amount: catMap['Transport'],
        percentOfSpent: this.calcCategoryPercent(catMap['Transport'], spent),
        icon: 'airplane-outline',
        colorClass: 'transport',
        barClass: 'transport-bar'
      },
      {
        name: 'Food',
        amount: catMap['Food'],
        percentOfSpent: this.calcCategoryPercent(catMap['Food'], spent),
        icon: 'restaurant-outline',
        colorClass: 'food',
        barClass: 'food-bar'
      },
      {
        name: 'Activities',
        amount: catMap['Activities'],
        percentOfSpent: this.calcCategoryPercent(catMap['Activities'], spent),
        icon: 'map-outline',
        colorClass: 'activities',
        barClass: 'activities-bar'
      },
      {
        name: 'Shopping',
        amount: catMap['Shopping'],
        percentOfSpent: this.calcCategoryPercent(catMap['Shopping'], spent),
        icon: 'bag-handle-outline',
        colorClass: 'shopping',
        barClass: 'shopping-bar'
      },
      {
        name: 'Other',
        amount: catMap['Other'],
        percentOfSpent: this.calcCategoryPercent(catMap['Other'], spent),
        icon: 'receipt-outline',
        colorClass: 'other',
        barClass: 'other-bar'
      }
    ];

    // Filter to categories that have spent amount > 0 only
    this.categoryBreakdown = allCategories.filter(c => c.amount > 0);
  }

  private calcCategoryPercent(amount: number, total: number): number {
    if (total <= 0) return 0;
    return Math.round((amount / total) * 100);
  }

  updateDisplayedExpenses() {
    if (this.isShowingAll) {
      this.displayedExpenses = [...this.expenses];
    } else {
      this.displayedExpenses = this.expenses.slice(0, 4);
    }
  }

  toggleViewAll() {
    this.isShowingAll = !this.isShowingAll;
    this.updateDisplayedExpenses();
    this.cdr.detectChanges();
  }

  // ================= EXPENSE ACTIONS =================
  openAddExpenseModal() {
    this.isEditingExpense = false;
    this.expenseModalTitle = 'Add Expense';
    this.expenseForm = {
      id: '',
      description: '',
      category: 'Accommodation',
      amount: null,
      date: new Date().toISOString().split('T')[0]
    };
    this.isExpenseModalOpen = true;
  }

  openEditExpenseModal(exp: Expense) {
    this.isEditingExpense = true;
    this.expenseModalTitle = 'Edit Expense';
    this.expenseForm = {
      id: exp.id,
      description: exp.description || '',
      category: exp.category,
      amount: exp.amount,
      date: exp.date || new Date().toISOString().split('T')[0]
    };
    this.isExpenseModalOpen = true;
  }

  closeExpenseModal() {
    this.isExpenseModalOpen = false;
  }

  async saveExpense() {
    const desc = this.expenseForm.description.trim();
    if (!desc) {
      await this.showToast('Please enter an expense description.', 'warning');
      return;
    }

    const amount = Number(this.expenseForm.amount);
    if (!amount || amount <= 0) {
      await this.showToast('Please enter a valid amount greater than ₱0.', 'warning');
      return;
    }

    if (!this.expenseForm.date) {
      await this.showToast('Please select a date.', 'warning');
      return;
    }

    const isEdit = this.isEditingExpense && !!this.expenseForm.id;
    const targetId = this.expenseForm.id;
    const cat = this.expenseForm.category;
    const dateVal = this.expenseForm.date;

    this.closeExpenseModal();

    if (isEdit) {
      // 1. Optimistic update in memory immediately
      const idx = this.expenses.findIndex(e => e.id === targetId);
      if (idx !== -1) {
        this.expenses[idx] = {
          ...this.expenses[idx],
          description: desc,
          category: cat,
          amount,
          date: dateVal
        };
      }
      this.calculateMetrics();
      this.updateDisplayedExpenses();
      this.cdr.detectChanges();

      await this.budgetService.updateExpense(targetId, {
        description: desc,
        category: cat,
        amount,
        date: dateVal
      });
      await this.showToast('Expense updated successfully.', 'success');
    } else {
      // 1. Optimistic add in memory immediately
      const tempExpense: Expense = {
        id: 'exp-' + Date.now(),
        itinerary_id: 'itin-1',
        description: desc,
        category: cat,
        amount,
        date: dateVal,
        created_at: new Date().toISOString()
      };
      this.expenses.push(tempExpense);
      this.calculateMetrics();
      this.updateDisplayedExpenses();
      this.cdr.detectChanges();

      const created = await this.budgetService.addExpense(tempExpense);
      if (created && created.id) {
        tempExpense.id = created.id;
      }
      await this.showToast('Expense recorded successfully.', 'success');
    }

    this.ngZone.run(() => {
      this.calculateMetrics();
      this.updateDisplayedExpenses();
      this.cdr.detectChanges();
    });
  }

  async deleteExpense(exp: Expense) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Expense',
      message: `Are you sure you want to delete "${exp.description}" (-₱${exp.amount.toLocaleString()})?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.ngZone.run(async () => {
              // Immediately remove from view and recalculate
              this.expenses = this.expenses.filter(e => e.id !== exp.id);
              this.calculateMetrics();
              this.updateDisplayedExpenses();
              this.cdr.detectChanges();

              await this.budgetService.deleteExpense(exp.id);
              await this.showToast('Expense deleted.', 'secondary');
            });
          }
        }
      ]
    });

    await alert.present();
  }

  // ================= BUDGET EDIT ACTIONS =================
  openEditBudgetModal() {
    this.budgetInput = this.totalBudget > 0 ? this.totalBudget : null;
    this.isBudgetModalOpen = true;
  }

  closeBudgetModal() {
    this.isBudgetModalOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.isBudgetModalOpen) {
      this.closeBudgetModal();
    }
    if (this.isExpenseModalOpen) {
      this.closeExpenseModal();
    }
  }

  async saveBudget() {
    const newBudget = Number(this.budgetInput);
    if (isNaN(newBudget) || newBudget <= 0) {
      await this.showToast('Please enter a valid positive budget amount.', 'warning');
      return;
    }

    this.budgetService.setTripBudget(newBudget);
    this.ngZone.run(() => {
      this.totalBudget = newBudget;
      this.calculateMetrics();
      this.closeBudgetModal();
      this.cdr.detectChanges();
    });
    await this.showToast(`Trip budget updated to ₱${newBudget.toLocaleString()}.`, 'success');
  }

  // ================= HELPERS =================
  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'Accommodation': return 'bed-outline';
      case 'Transport': return 'airplane-outline';
      case 'Food': return 'restaurant-outline';
      case 'Activities': return 'map-outline';
      case 'Shopping': return 'bag-handle-outline';
      default: return 'receipt-outline';
    }
  }

  getCategoryClass(category: string): string {
    switch (category) {
      case 'Accommodation': return 'accommodation';
      case 'Transport': return 'transport';
      case 'Food': return 'food';
      case 'Activities': return 'activities';
      case 'Shopping': return 'shopping';
      default: return 'other';
    }
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'secondary' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'bottom',
      color: color === 'success' ? 'success' : color === 'warning' ? 'warning' : 'dark'
    });
    await toast.present();
  }
}