import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { SupabaseService } from '../services/supabase.service';
import { Subscription } from 'rxjs';

export interface ProfileUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  verified: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  imports: [RouterLink, IonContent, CommonModule, FormsModule]
})
export class AdminPage implements OnInit, OnDestroy {
  currentView = 'dashboard';
  sidebarOpen = false;
  notifMenuOpen = false;
  accountMenuOpen = false;

  adminName = 'Admin';
  adminEmail = 'admin@tripmate.app';
  adminInitials = 'A';

  // User Management
  users: ProfileUser[] = [];
  filteredUsers: ProfileUser[] = [];
  filteredAdmins: ProfileUser[] = [];
  isLoading = false;
  usersLoading = false;
  usersSearchQuery = '';
  selectedRoleFilter = 'all';
  adminsSearchQuery = '';

  // User Modal State
  userModalOpen = false;
  editingUserId: string | null = null;
  userFormModel = {
    name: '',
    email: '',
    role: 'guest',
    isActive: true,
    verified: false
  };

  private authSub?: Subscription;
  private docClickListener?: (e: MouseEvent) => void;

  constructor(
    private auth: AuthService,
    private supabase: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.authSub = this.auth.currentUser$.subscribe(u => {
      if (u && u !== 'loading') {
        this.adminName = u.full_name || 'Admin';
        this.adminEmail = u.email || 'admin@tripmate.app';
        this.adminInitials = u.full_name ? u.full_name.charAt(0).toUpperCase() : 'A';
      }
    });

    this.docClickListener = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.topbar-notif')) {
        this.notifMenuOpen = false;
      }
      if (!target.closest('.topbar-account')) {
        this.accountMenuOpen = false;
      }

      const gotoBtn = target.closest('[data-goto]');
      if (gotoBtn) {
        const targetView = gotoBtn.getAttribute('data-goto');
        if (targetView) this.switchView(targetView, e);
      }
    };
    document.addEventListener('click', this.docClickListener);

    // Fetch initial user data from Supabase
    await this.loadUsers();
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
    if (this.docClickListener) {
      document.removeEventListener('click', this.docClickListener);
    }
  }

  async loadUsers() {
    this.isLoading = true;
    this.usersLoading = true;
    try {
      const { data, error, count } = await this.supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: true });

      console.log('USERS QUERY — data:', data);
      console.log('USERS QUERY — error:', error);
      console.log('USERS QUERY — count:', count);

      if (error) {
        console.error('Error fetching users from Supabase:', error);
        this.users = [];
      } else if (data) {
        this.users = data.map((u: any) => ({
          id: u.id,
          name: u.full_name || u.name || 'Unnamed user',
          email: u.email || '',
          role: (u.role || 'guest').toLowerCase(),
          isActive: u.is_active !== false,
          verified: Boolean(u.verified),
          createdAt: u.created_at || u.createdAt || new Date().toISOString()
        }));
      }
    } catch (err) {
      console.error('Unexpected error loading users:', err);
      this.users = [];
    } finally {
      this.isLoading = false;
      this.usersLoading = false;
      this.applyUserFilters();
      this.applyAdminFilters();
      this.cdr.detectChanges();
    }
  }

  applyUserFilters() {
    const q = this.usersSearchQuery.trim().toLowerCase();
    const role = this.selectedRoleFilter;

    this.filteredUsers = this.users.filter(u => {
      const matchesSearch = !q || `${u.name} ${u.email}`.toLowerCase().includes(q);
      const matchesRole = role === 'all' || u.role === role;
      return matchesSearch && matchesRole;
    });
  }

  applyAdminFilters() {
    const q = this.adminsSearchQuery.trim().toLowerCase();
    this.filteredAdmins = this.users.filter(u => {
      const isRoleAdmin = u.role === 'admin';
      const matchesSearch = !q || `${u.name} ${u.email}`.toLowerCase().includes(q);
      return isRoleAdmin && matchesSearch;
    });
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  getAvatarColor(key?: string): string {
    const colors = ['#18635B', '#FF6B4A', '#2563EB', '#7C3AED', '#DB2777', '#D97706'];
    if (!key) return colors[0];
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  getRoleBadgeClass(role?: string): string {
    switch (role?.toLowerCase()) {
      case 'admin': return 'badge-blue';
      case 'host': return 'badge-amber';
      default: return 'badge-green';
    }
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  openAddUserModal() {
    this.editingUserId = null;
    this.userFormModel = {
      name: '',
      email: '',
      role: 'guest',
      isActive: true,
      verified: false
    };
    this.userModalOpen = true;
  }

  openEditUserModal(user: ProfileUser) {
    this.editingUserId = user.id;
    this.userFormModel = {
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      verified: user.verified
    };
    this.userModalOpen = true;
  }

  closeUserModal() {
    this.userModalOpen = false;
    this.editingUserId = null;
  }

  async saveUser() {
    if (!this.userFormModel.name.trim() || !this.userFormModel.email.trim()) {
      alert('Please enter a name and email.');
      return;
    }

    try {
      if (this.editingUserId) {
        const { error } = await this.supabase
          .from('profiles')
          .update({
            full_name: this.userFormModel.name,
            role: this.userFormModel.role,
            is_active: this.userFormModel.isActive,
            updated_at: new Date().toISOString()
          })
          .eq('id', this.editingUserId);

        if (error) {
          console.error('Failed to update user profile:', error);
          alert('Error updating user: ' + error.message);
          return;
        }
      }

      this.closeUserModal();
      await this.loadUsers();
    } catch (err: any) {
      console.error('Error saving user:', err);
      alert('Error saving user: ' + (err.message || err));
    }
  }

  async toggleUserActive(user: ProfileUser) {
    const newStatus = !user.isActive;
    try {
      const { error } = await this.supabase
        .from('profiles')
        .update({
          is_active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Failed to toggle user status:', error);
      } else {
        user.isActive = newStatus;
        this.applyUserFilters();
        this.applyAdminFilters();
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  }

  switchView(viewName: string, event?: Event) {
    if (event) event.preventDefault();
    this.currentView = viewName;
    this.sidebarOpen = false;

    if (viewName === 'users' || viewName === 'admins') {
      this.loadUsers();
    }

    // Update active nav-item buttons
    const navButtons = document.querySelectorAll('.sidebar-nav .nav-item');
    navButtons.forEach(btn => {
      if (btn.getAttribute('data-view') === viewName) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });

    // Update active view sections
    const views = document.querySelectorAll('.view');
    views.forEach(v => {
      if (v.id === `view-${viewName}`) {
        v.classList.add('is-active');
      } else {
        v.classList.remove('is-active');
      }
    });
  }

  toggleMobileSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleNotifMenu(event: Event) {
    event.stopPropagation();
    this.notifMenuOpen = !this.notifMenuOpen;
    this.accountMenuOpen = false;
  }

  toggleAccountMenu(event: Event) {
    event.stopPropagation();
    this.accountMenuOpen = !this.accountMenuOpen;
    this.notifMenuOpen = false;
  }

  async logout() {
    await this.auth.signOut();
  }
}
