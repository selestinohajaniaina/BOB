import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnDestroy, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { Project, ProjectService } from '../../core/services/project.service';
import { Diagram, DiagramService } from '../../core/services/diagram.service';

@Component({ selector: 'app-project-diagrams', standalone: true, imports: [RouterLink, ReactiveFormsModule, DatePipe], templateUrl: './project-diagrams.component.html' })
export class ProjectDiagramsComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);
  private readonly diagramService = inject(DiagramService);
  private readonly svgUrls = new Map<number, string>();
  readonly promptControl = new FormControl('', { nonNullable: true, validators: [Validators.maxLength(4000)] });
  project: Project | null = null;
  diagrams: Diagram[] = [];
  selectedDiagram: Diagram | null = null;
  isLoading = true;
  isGenerating = false;
  deletingId: number | null = null;
  openingId: number | null = null;
  error = '';
  success = '';
  readonly projectId: number;
  @HostListener('submit', ['$event'])
  preventNativeSubmit(event: SubmitEvent): void { event.preventDefault(); }
  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.projectId = id;
    if (!Number.isInteger(id) || id <= 0) { this.isLoading = false; this.error = 'Identifiant de projet invalide.'; return; }
    forkJoin({ projectResponse: this.projectService.getProject(id), diagramsResponse: this.diagramService.getDiagrams(id) }).pipe(finalize(() => this.isLoading = false)).subscribe({
      next: ({ projectResponse, diagramsResponse }) => { this.project = projectResponse.project; this.diagrams = diagramsResponse.diagrams; },
      error: (error: HttpErrorResponse) => this.error = error.status === 0 ? 'Impossible de joindre le serveur.' : error.error?.message || 'Impossible de charger le projet.'
    });
  }
  generate(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.error = ''; this.success = '';
    if (this.promptControl.invalid) {
      this.promptControl.markAsTouched();
      return;
    }
    this.isGenerating = true;
    this.promptControl.disable();
    this.diagramService.generateUseCase(this.projectId, this.promptControl.getRawValue().trim()).pipe(finalize(() => { this.isGenerating = false; this.promptControl.enable(); })).subscribe({
      next: ({ diagram, message }) => { this.diagrams = [diagram, ...this.diagrams]; this.selectedDiagram = diagram; this.promptControl.reset(); this.success = message || 'Diagramme généré avec succès.'; },
      error: (error: HttpErrorResponse) => this.error = error.status === 0 ? 'Impossible de joindre le serveur BOB.' : error.error?.message || 'La génération du diagramme a échoué. Veuillez réessayer.'
    });
  }
  open(diagram: Diagram): void {
    this.success = ''; this.error = '';
    if (diagram.svg) { this.selectedDiagram = diagram; return; }
    this.openingId = diagram.id;
    this.diagramService.getDiagram(this.projectId, diagram.id).pipe(finalize(() => this.openingId = null)).subscribe({
      next: ({ diagram: loaded }) => { this.diagrams = this.diagrams.map((item) => item.id === loaded.id ? loaded : item); this.selectedDiagram = loaded; },
      error: (error: HttpErrorResponse) => this.error = error.error?.message || 'Impossible d’afficher le diagramme.'
    });
  }
  delete(diagram: Diagram): void {
    if (!confirm(`Supprimer « ${diagram.name} » ?`)) return;
    this.deletingId = diagram.id; this.error = '';
    this.diagramService.deleteDiagram(this.projectId, diagram.id).pipe(finalize(() => this.deletingId = null)).subscribe({
      next: () => { this.revokeSvgUrl(diagram.id); this.diagrams = this.diagrams.filter((item) => item.id !== diagram.id); if (this.selectedDiagram?.id === diagram.id) this.selectedDiagram = null; },
      error: (error: HttpErrorResponse) => this.error = error.error?.message || 'Impossible de supprimer le diagramme.'
    });
  }
  svgUrl(diagram: Diagram): string {
    const cached = this.svgUrls.get(diagram.id);
    if (cached) return cached;
    const url = URL.createObjectURL(new Blob([diagram.svg || ''], { type: 'image/svg+xml' }));
    this.svgUrls.set(diagram.id, url);
    return url;
  }
  private revokeSvgUrl(id: number): void { const url = this.svgUrls.get(id); if (url) URL.revokeObjectURL(url); this.svgUrls.delete(id); }
  ngOnDestroy(): void { for (const url of this.svgUrls.values()) URL.revokeObjectURL(url); this.svgUrls.clear(); }
}
