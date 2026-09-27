import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Project, ProjectService } from '../../core/services/project.service';
import { canReplaceContext, readContextFile, validateContextFile } from './context-file.util';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';

@Component({ selector: 'app-project-detail', standalone: true, imports: [RouterLink, DatePipe, ReactiveFormsModule, MarkdownPipe], templateUrl: './project-detail.component.html' })
export class ProjectDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ProjectService);
  project: Project | null = null;
  isLoading = true;
  isSaving = false;
  isReadingFile = false;
  error = '';
  contextError = '';
  contextSuccess = '';
  editContext = false;
  selectedFileName = '';
  readonly contextControl = new FormControl('', { nonNullable: true });
  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) { this.isLoading = false; this.error = 'Identifiant de projet invalide.'; return; }
    this.service.getProject(id).pipe(finalize(() => this.isLoading = false)).subscribe({ next: ({ project }) => this.project = project, error: (error: HttpErrorResponse) => this.error = error.error?.message || 'Impossible de charger le projet.' });
  }
  startManualEdit(): void { this.contextControl.setValue(this.project?.context || ''); this.editContext = true; this.selectedFileName = ''; this.contextError = ''; this.contextSuccess = ''; }
  saveManualContext(): void {
    if (!this.project) return;
    const context = this.contextControl.value.trim();
    if (this.project.context && this.project.context !== context && !confirm('Remplacer le contexte actuel du projet ?')) return;
    this.isSaving = true; this.contextError = '';
    this.service.updateProject(this.project.id, { name: this.project.name, context: context ? this.contextControl.value : null }).pipe(finalize(() => this.isSaving = false)).subscribe({
      next: ({ project }) => { this.project = project; this.editContext = false; this.contextSuccess = context ? 'Contexte mis à jour avec succès.' : 'Contexte supprimé.'; },
      error: (error: HttpErrorResponse) => this.contextError = this.message(error, 'Impossible de modifier le contexte.')
    });
  }
  openImport(): void { this.startManualEdit(); }
  async selectContextFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement; const file = input.files?.[0]; this.contextError = ''; this.selectedFileName = '';
    if (!file) return;
    const validationError = validateContextFile(file);
    if (validationError) { this.contextError = validationError; input.value = ''; return; }
    if (!canReplaceContext(this.contextControl.value)) { input.value = ''; return; }
    try {
      this.isReadingFile = true; const content = await readContextFile(file);
      this.contextControl.setValue(content); this.contextControl.markAsDirty(); this.selectedFileName = file.name;
    } catch (error) { this.contextError = error instanceof Error ? error.message : 'Impossible de lire le fichier sélectionné.'; }
    finally { this.isReadingFile = false; input.value = ''; }
  }
  private message(error: HttpErrorResponse, fallback: string): string { return error.status === 0 ? 'Impossible de joindre le serveur.' : error.error?.message || fallback; }
}
