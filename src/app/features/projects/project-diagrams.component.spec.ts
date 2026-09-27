import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ProjectService } from '../../core/services/project.service';
import { ProjectDiagramsComponent } from './project-diagrams.component';
import { DiagramService } from '../../core/services/diagram.service';
import { PlantumlService } from '../../services/plantuml.service';

describe('ProjectDiagramsComponent', () => {
  let fixture: ComponentFixture<ProjectDiagramsComponent>;
  const project = { id: 15, name: 'Gestion de bibliothèque', description: 'Projet UML', context: '# Contexte', createdAt: '2026-01-01', updatedAt: '2026-01-02' };
  const service = jasmine.createSpyObj<ProjectService>('ProjectService', ['getProject']);
  const diagramService = jasmine.createSpyObj<DiagramService>('DiagramService', ['getDiagrams', 'generateUseCase', 'deleteDiagram']);
  const plantumlService = jasmine.createSpyObj<PlantumlService>('PlantumlService', ['encodePlantText']);
  beforeEach(async () => {
    service.getProject.and.returnValue(of({ project }));
    diagramService.getDiagrams.and.returnValue(of({ diagrams: [] }));
    plantumlService.encodePlantText.and.returnValue('encoded');
    await TestBed.configureTestingModule({ imports: [ProjectDiagramsComponent], providers: [provideRouter([]), { provide: ProjectService, useValue: service }, { provide: DiagramService, useValue: diagramService }, { provide: PlantumlService, useValue: plantumlService }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '15' }) } } }] }).compileComponents();
    fixture = TestBed.createComponent(ProjectDiagramsComponent); fixture.detectChanges();
  });
  it('loads the URL project and shows the honest empty state', () => {
    expect(service.getProject).toHaveBeenCalledWith(15);
    expect(diagramService.getDiagrams).toHaveBeenCalledWith(15);
    const element = fixture.nativeElement as HTMLElement;
    expect(element.innerText).toContain('Gestion de bibliothèque');
    expect(element.innerText).toContain('Aucun diagramme n’a encore été créé pour ce projet.');
  });
  it('prevents the browser native form navigation', () => {
    const form = (fixture.nativeElement as HTMLElement).querySelector('form')!;
    const submit = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submit);
    expect(submit.defaultPrevented).toBeTrue();
  });
  it('generates through the backend and displays the returned diagram', () => {
    const diagram = { id: 1, projectId: 15, name: 'Cas d’utilisation', type: 'use_case' as const, prompt: 'Acteurs', plantUml: '@startuml\nactor User\n@enduml', createdAt: '2026-01-01', updatedAt: '2026-01-01' };
    diagramService.generateUseCase.and.returnValue(of({ message: 'ok', diagram }));
    fixture.componentInstance.promptControl.setValue('Acteurs'); fixture.componentInstance.generate(); fixture.detectChanges();
    expect(diagramService.generateUseCase).toHaveBeenCalledWith(15, 'Acteurs');
    expect(fixture.componentInstance.selectedDiagram).toEqual(diagram);
  });
  it('shows the backend generation error', () => {
    diagramService.generateUseCase.and.returnValue(throwError(() => new HttpErrorResponse({ status: 502, error: { message: 'Réponse IA invalide' } })));
    fixture.componentInstance.promptControl.setValue('Acteurs'); fixture.componentInstance.generate(); fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).innerText).toContain('Réponse IA invalide');
  });
});
