import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-workspace-layout',
  standalone: true,
  imports: [AsyncPipe, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './workspace-layout.component.html'
})
export class WorkspaceLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly currentUser$ = this.authService.currentUser$;
  sidebarOpen = false;
  profileMenuOpen = false;

  initials(user: User | null): string {
    if (!user?.name) return 'BO';
    return user.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }

  closeNavigation(): void { this.sidebarOpen = false; }

  logout(): void {
    this.authService.logout();
    this.sidebarOpen = false;
    this.profileMenuOpen = false;
    void this.router.navigateByUrl('/login');
  }
}
