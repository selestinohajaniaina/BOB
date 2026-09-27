import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Project, ProjectService } from '../../core/services/project.service';
import {
  canReplaceContext,
  readContextFile,
  validateContextFile,
} from './context-file.util';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, DatePipe],
  templateUrl: './projects.component.html',
})
export class ProjectsComponent {
  private readonly projectService = inject(ProjectService);
  private readonly route = inject(ActivatedRoute);
  projects: Project[] = [];
  search = '';
  isLoading = true;
  isSaving = false;
  isLoadingForm = false;
  isReadingFile = false;
  deletingId: number | null = null;
  error = '';
  success = '';
  formOpen = false;
  editingProject: Project | null = null;
  fileError = '';
  selectedFileName = '';
  readonly projectForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(2000)],
    }),
    context: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.loadProjects();
    if (this.route.snapshot.queryParamMap.get('new') === '1') this.openCreate();
  }
  get filteredProjects(): Project[] {
    const query = this.search.trim().toLowerCase();
    return query
      ? this.projects.filter((p) =>
          `${p.name} ${p.description || ''}`.toLowerCase().includes(query)
        )
      : this.projects;
  }
  get recentProjects(): Project[] {
    return this.projects.slice(0, 3);
  }
  get lastModified(): Project | null {
    return this.projects[0] || null;
  }

  loadProjects(): void {
    this.isLoading = true;
    this.error = '';
    this.projectService
      .getProjects()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: ({ projects }) => (this.projects = projects),
        error: (error) =>
          (this.error = this.message(
            error,
            'Impossible de charger les projets.'
          )),
      });
  }
  openCreate(): void {
    this.editingProject = null;
    this.selectedFileName = '';
    this.fileError = '';
    this.projectForm.reset({ name: '', description: '', context: '' });
    this.formOpen = true;
    this.error = '';
  }
  openEdit(project: Project): void {
    this.editingProject = project;
    this.formOpen = true;
    this.isLoadingForm = true;
    this.selectedFileName = '';
    this.fileError = '';
    this.error = '';
    this.projectService
      .getProject(project.id)
      .pipe(finalize(() => (this.isLoadingForm = false)))
      .subscribe({
        next: ({ project: fullProject }) => {
          this.editingProject = fullProject;
          this.projectForm.reset({
            name: fullProject.name,
            description: fullProject.description || '',
            context: fullProject.context || '',
          });
        },
        error: (error) => {
          this.error = this.message(error, 'Impossible de charger le projet.');
          this.formOpen = false;
        },
      });
  }
  closeForm(): void {
    if (!this.isSaving) this.formOpen = false;
  }
  async selectContextFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.fileError = '';
    this.selectedFileName = '';
    if (!file) return;
    const validationError = validateContextFile(file);
    if (validationError) {
      this.fileError = validationError;
      input.value = '';
      return;
    }
    if (!canReplaceContext(this.projectForm.controls.context.value)) {
      input.value = '';
      return;
    }
    try {
      this.isReadingFile = true;
      const content = await readContextFile(file);
      this.projectForm.controls.context.setValue(content);
      this.projectForm.controls.context.markAsDirty();
      this.selectedFileName = file.name;
    } catch (error) {
      this.fileError =
        error instanceof Error
          ? error.message
          : 'Impossible de lire le fichier sélectionné.';
    } finally {
      this.isReadingFile = false;
      input.value = '';
    }
  }
  save(): void {
    this.success = '';
    this.error = '';
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    this.projectForm.disable();
    const value = this.projectForm.getRawValue();
    const payload = {
      name: value.name.trim(),
      description: value.description.trim(),
      context: value.context.trim() ? value.context : null,
    };
    const request = this.editingProject
      ? this.projectService.updateProject(this.editingProject.id, payload)
      : this.projectService.createProject(payload);
    request
      .pipe(
        finalize(() => {
          this.isSaving = false;
          this.projectForm.enable();
        })
      )
      .subscribe({
        next: ({ project }) => {
          project.hasContext = value.context.trim() !== '';
          if (this.editingProject)
            this.projects = this.projects
              .map((item) => (item.id === project.id ? project : item))
              .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
          else this.projects = [project, ...this.projects];
          this.success = this.editingProject
            ? 'Projet modifié avec succès.'
            : 'Projet créé avec succès.';
          this.formOpen = false;
        },
        error: (error) =>
          (this.error = this.message(
            error,
            'Impossible d’enregistrer le projet.'
          )),
      });
  }
  deleteProject(project: Project): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer « ${project.name} » ?`))
      return;
    this.deletingId = project.id;
    this.error = '';
    this.success = '';
    this.projectService
      .deleteProject(project.id)
      .pipe(finalize(() => (this.deletingId = null)))
      .subscribe({
        next: () => {
          this.projects = this.projects.filter(
            (item) => item.id !== project.id
          );
          this.success = 'Projet supprimé avec succès.';
        },
        error: (error) =>
          (this.error = this.message(
            error,
            'Impossible de supprimer le projet.'
          )),
      });
  }
  private message(error: HttpErrorResponse, fallback: string): string {
    return error.status === 0
      ? 'Impossible de joindre le serveur.'
      : error.error?.message || fallback;
  }
}
