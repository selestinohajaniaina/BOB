import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { DatePipe, JsonPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { Project, ProjectService } from '../../core/services/project.service';
import { Diagram, DiagramService } from '../../core/services/diagram.service';
import { render } from 'puml-canvas-js';
import { BobDiagram } from './diagram-editor/bob-diagram.model';
import { PlantUmlToBobJsonService } from './diagram-editor/plant-uml-to-bob-json.service';
import { UseCaseEditorComponent } from './diagram-editor/use-case-editor.component';

@Component({ selector: 'app-project-diagrams', standalone: true, imports: [RouterLink, ReactiveFormsModule, DatePipe, JsonPipe, UseCaseEditorComponent], templateUrl: './project-diagrams.component.html' })
export class ProjectDiagramsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);
  private readonly diagramService = inject(DiagramService);
  private readonly plantUmlToBobJson = inject(PlantUmlToBobJsonService);
  private renderHost: HTMLElement | null = null;
  @ViewChild('diagramCanvas')
  set diagramCanvas(element: ElementRef<HTMLElement> | undefined) {
    this.renderHost = element?.nativeElement ?? null;
    if (this.renderHost && this.selectedDiagram) this.renderDiagram(this.selectedDiagram);
  }
  readonly promptControl = new FormControl('', { nonNullable: true, validators: [Validators.maxLength(4000)] });
  project: Project | null = null;
  diagrams: Diagram[] = [];
  selectedDiagram: Diagram | null = null;
  isLoading = true;
  isGenerating = false;
  deletingId: number | null = null;
  isEditModalOpen = false;
  bobDiagram: BobDiagram | null = null;
  editorError = '';
  renderError = '';
  error = '';
  success = '';
  readonly projectId: number;
  @HostListener('submit', ['$event'])
  preventNativeSubmit(event: SubmitEvent): void { event.preventDefault(); }
  @HostListener('document:keydown.escape')
  closeEditModalOnEscape(): void { this.closeEditModal(); }
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
      next: ({ diagram, message }) => { this.diagrams = [diagram, ...this.diagrams]; this.selectDiagram(diagram); this.promptControl.reset(); this.success = message || 'Diagramme généré avec succès.'; },
      error: (error: HttpErrorResponse) => this.error = error.status === 0 ? 'Impossible de joindre le serveur BOB.' : error.error?.message || 'La génération du diagramme a échoué. Veuillez réessayer.'
    });
  }
  open(diagram: Diagram): void {
    this.success = ''; this.error = '';
    this.selectDiagram(diagram);
  }
  delete(diagram: Diagram): void {
    if (!confirm(`Supprimer « ${diagram.name} » ?`)) return;
    this.deletingId = diagram.id; this.error = '';
    this.diagramService.deleteDiagram(this.projectId, diagram.id).pipe(finalize(() => this.deletingId = null)).subscribe({
      next: () => { this.diagrams = this.diagrams.filter((item) => item.id !== diagram.id); if (this.selectedDiagram?.id === diagram.id) { this.selectedDiagram = null; this.renderError = ''; } },
      error: (error: HttpErrorResponse) => this.error = error.error?.message || 'Impossible de supprimer le diagramme.'
    });
  }
  openEditModal(): void {
    if (!this.selectedDiagram) return;
    this.editorError = '';
    try {
      this.bobDiagram = this.plantUmlToBobJson.convert(this.selectedDiagram.plantUml);
    } catch (error) {
      console.error('Échec de la conversion PlantUML vers le modèle BOB', error);
      this.bobDiagram = null;
      this.editorError = 'Impossible de préparer ce diagramme pour l’éditeur.';
    }
    this.isEditModalOpen = true;
  }
  closeEditModal(): void { this.isEditModalOpen = false; }
  private selectDiagram(diagram: Diagram): void {
    this.renderError = '';
    this.selectedDiagram = diagram;
    if (this.renderHost) this.renderDiagram(diagram);
  }
  private renderDiagram(diagram: Diagram): void {
    const host = this.renderHost;
    if (!host) return;
    host.replaceChildren();
    this.renderError = '';
    try {
      const svg = render(diagram.plantUml);
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', `Diagramme de cas d’utilisation ${diagram.name}`);
      svg.style.display = 'block';
      svg.style.margin = 'auto';
      svg.style.maxWidth = '100%';
      svg.style.height = 'auto';
      host.appendChild(svg);
    } catch (error) {
      console.error('Échec du rendu PlantUML côté navigateur', error);
      queueMicrotask(() => {
        this.renderError = 'Impossible d’afficher ce diagramme. Le code PlantUML enregistré semble invalide ou non pris en charge.';
      });
    }
  }
}
