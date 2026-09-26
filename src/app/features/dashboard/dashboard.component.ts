import { AsyncPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { Project, ProjectService } from '../../core/services/project.service';

@Component({ selector: 'app-dashboard', standalone: true, imports: [AsyncPipe, DatePipe, RouterLink], templateUrl: './dashboard.component.html' })
export class DashboardComponent {
  private readonly projectService = inject(ProjectService);
  readonly currentUser$ = inject(AuthService).currentUser$;
  projects: Project[] = [];
  isLoading = true;
  error = '';

  constructor() { this.loadProjects(); }

  get recentProjects(): Project[] { return this.projects.slice(0, 3); }
  get lastModified(): Project | null { return this.projects[0] ?? null; }

  loadProjects(): void {
    this.isLoading = true;
    this.error = '';
    this.projectService.getProjects().pipe(finalize(() => this.isLoading = false)).subscribe({
      next: ({ projects }) => this.projects = projects,
      error: (error: HttpErrorResponse) => this.error = error.status === 0 ? 'Impossible de joindre le serveur.' : error.error?.message || 'Impossible de charger vos projets.'
    });
  }
}
