import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Project, ProjectService } from '../../core/services/project.service';

@Component({ selector: 'app-project-detail', standalone: true, imports: [RouterLink, DatePipe], templateUrl: './project-detail.component.html' })
export class ProjectDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ProjectService);
  project: Project | null = null;
  isLoading = true;
  error = '';
  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) { this.isLoading = false; this.error = 'Identifiant de projet invalide.'; return; }
    this.service.getProject(id).pipe(finalize(() => this.isLoading = false)).subscribe({ next: ({ project }) => this.project = project, error: (error: HttpErrorResponse) => this.error = error.error?.message || 'Impossible de charger le projet.' });
  }
}
