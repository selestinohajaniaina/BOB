import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Project, ProjectService } from '../../core/services/project.service';

@Component({ selector: 'app-projects', standalone: true, imports: [NavbarComponent, RouterLink, ReactiveFormsModule, DatePipe], templateUrl: './projects.component.html' })
export class ProjectsComponent {
  private readonly projectService = inject(ProjectService);
  projects: Project[] = [];
  search = '';
  isLoading = true;
  isSaving = false;
  deletingId: number | null = null;
  error = '';
  success = '';
  formOpen = false;
  editingProject: Project | null = null;
  readonly projectForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(2000)] })
  });

  constructor() { this.loadProjects(); }
  get filteredProjects(): Project[] {
    const query = this.search.trim().toLowerCase();
    return query ? this.projects.filter((p) => `${p.name} ${p.description || ''}`.toLowerCase().includes(query)) : this.projects;
  }
  get recentProjects(): Project[] { return this.projects.slice(0, 3); }
  get lastModified(): Project | null { return this.projects[0] || null; }

  loadProjects(): void {
    this.isLoading = true; this.error = '';
    this.projectService.getProjects().pipe(finalize(() => this.isLoading = false)).subscribe({
      next: ({ projects }) => this.projects = projects,
      error: (error) => this.error = this.message(error, 'Impossible de charger les projets.')
    });
  }
  openCreate(): void { this.editingProject = null; this.projectForm.reset({ name: '', description: '' }); this.formOpen = true; this.error = ''; }
  openEdit(project: Project): void { this.editingProject = project; this.projectForm.reset({ name: project.name, description: project.description || '' }); this.formOpen = true; this.error = ''; }
  closeForm(): void { if (!this.isSaving) this.formOpen = false; }
  save(): void {
    this.success = ''; this.error = '';
    if (this.projectForm.invalid) { this.projectForm.markAllAsTouched(); return; }
    this.isSaving = true; this.projectForm.disable();
    const payload = { name: this.projectForm.getRawValue().name.trim(), description: this.projectForm.getRawValue().description.trim() };
    const request = this.editingProject ? this.projectService.updateProject(this.editingProject.id, payload) : this.projectService.createProject(payload);
    request.pipe(finalize(() => { this.isSaving = false; this.projectForm.enable(); })).subscribe({
      next: ({ project }) => {
        if (this.editingProject) this.projects = this.projects.map((item) => item.id === project.id ? project : item).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        else this.projects = [project, ...this.projects];
        this.success = this.editingProject ? 'Projet modifié avec succès.' : 'Projet créé avec succès.';
        this.formOpen = false;
      },
      error: (error) => this.error = this.message(error, 'Impossible d’enregistrer le projet.')
    });
  }
  deleteProject(project: Project): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer « ${project.name} » ?`)) return;
    this.deletingId = project.id; this.error = ''; this.success = '';
    this.projectService.deleteProject(project.id).pipe(finalize(() => this.deletingId = null)).subscribe({
      next: () => { this.projects = this.projects.filter((item) => item.id !== project.id); this.success = 'Projet supprimé avec succès.'; },
      error: (error) => this.error = this.message(error, 'Impossible de supprimer le projet.')
    });
  }
  private message(error: HttpErrorResponse, fallback: string): string { return error.status === 0 ? 'Impossible de joindre le serveur.' : error.error?.message || fallback; }
}
