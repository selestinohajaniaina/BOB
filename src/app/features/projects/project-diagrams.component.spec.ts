import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProjectService } from '../../core/services/project.service';
import { ProjectDiagramsComponent } from './project-diagrams.component';

describe('ProjectDiagramsComponent', () => {
  let fixture: ComponentFixture<ProjectDiagramsComponent>;
  const project = { id: 15, name: 'Gestion de bibliothèque', description: 'Projet UML', context: '# Contexte', createdAt: '2026-01-01', updatedAt: '2026-01-02' };
  const service = jasmine.createSpyObj<ProjectService>('ProjectService', ['getProject']);
  beforeEach(async () => {
    service.getProject.and.returnValue(of({ project }));
    await TestBed.configureTestingModule({ imports: [ProjectDiagramsComponent], providers: [provideRouter([]), { provide: ProjectService, useValue: service }, { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '15' }) } } }] }).compileComponents();
    fixture = TestBed.createComponent(ProjectDiagramsComponent); fixture.detectChanges();
  });
  it('loads the URL project and shows the honest empty state', () => {
    expect(service.getProject).toHaveBeenCalledWith(15);
    const element = fixture.nativeElement as HTMLElement;
    expect(element.innerText).toContain('Gestion de bibliothèque');
    expect(element.innerText).toContain('Aucun diagramme n’a encore été créé pour ce projet.');
    expect(element.querySelectorAll('[disabled]').length).toBeGreaterThan(0);
  });
});
