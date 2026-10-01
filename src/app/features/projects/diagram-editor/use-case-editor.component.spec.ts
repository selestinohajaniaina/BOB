import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BobDiagram } from './bob-diagram.model';
import { UseCaseEditorComponent } from './use-case-editor.component';

describe('UseCaseEditorComponent', () => {
  let fixture: ComponentFixture<UseCaseEditorComponent>;
  let component: UseCaseEditorComponent;
  let diagram: BobDiagram;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UseCaseEditorComponent] }).compileComponents();
    diagram = {
      version: 1,
      type: 'use_case',
      actors: [{ id: 'actor_tm', kind: 'actor', name: 'Technicien mobile', x: 120, y: 110 }],
      useCases: [
        { id: 'usecase_register', kind: 'use_case', name: 'Enregistrer Cultivateur', x: 480, y: 120 },
        { id: 'usecase_search', kind: 'use_case', name: 'Rechercher Cultivateur', x: 480, y: 270 }
      ],
      relationships: [
        { id: 'relation_1', from: 'actor_tm', to: 'usecase_register', type: 'association' },
        { id: 'relation_2', from: 'usecase_register', to: 'usecase_search', type: 'include' },
        { id: 'relation_3', from: 'usecase_search', to: 'usecase_register', type: 'extend' }
      ]
    };
    fixture = TestBed.createComponent(UseCaseEditorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('diagram', diagram);
    fixture.detectChanges();

    const canvas = fixture.nativeElement.querySelector('svg') as SVGSVGElement;
    spyOn(canvas, 'getBoundingClientRect').and.returnValue({ left: 0, top: 0, width: 900, height: 520 } as DOMRect);
    spyOn(canvas, 'setPointerCapture');
    spyOn(canvas, 'hasPointerCapture').and.returnValue(false);
  });

  it('moves an actor in BOB JSON and keeps its relationship attached', () => {
    const actor = fixture.nativeElement.querySelector('[data-element-id="actor_tm"]') as SVGGElement;
    const canvas = fixture.nativeElement.querySelector('svg') as SVGSVGElement;
    actor.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 120, clientY: 110 }));
    canvas.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1, clientX: 250, clientY: 220 }));
    fixture.detectChanges();

    expect(diagram.actors[0].x).toBe(250);
    expect(diagram.actors[0].y).toBe(220);
    const relationship = fixture.nativeElement.querySelector('[data-relationship-id="relation_1"]') as SVGLineElement;
    expect(relationship.getAttribute('x1')).toBe('250');
    expect(relationship.getAttribute('y1')).toBe('220');
  });

  it('moves a use case while preserving include and extend relationships', () => {
    const useCase = fixture.nativeElement.querySelector('[data-element-id="usecase_register"]') as SVGGElement;
    const canvas = fixture.nativeElement.querySelector('svg') as SVGSVGElement;
    useCase.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 2, clientX: 480, clientY: 120 }));
    canvas.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 2, clientX: 620, clientY: 300 }));
    fixture.detectChanges();

    expect(diagram.useCases[0].x).toBe(620);
    expect(diagram.useCases[0].y).toBe(300);
    expect(diagram.relationships.map((relationship) => relationship.type)).toEqual(['association', 'include', 'extend']);
    expect((fixture.nativeElement.querySelector('[data-relationship-id="relation_2"]') as SVGLineElement).getAttribute('x1')).toBe('620');
    expect((fixture.nativeElement.querySelector('[data-relationship-id="relation_3"]') as SVGLineElement).getAttribute('x2')).toBe('620');
  });

  it('renames an actor and a use case in the in-memory diagram', () => {
    component.select(diagram.actors[0]);
    component.draftName = 'Technicien terrain';
    component.applyName();
    component.select(diagram.useCases[0]);
    component.draftName = 'Enregistrer un cultivateur';
    component.applyName();
    fixture.detectChanges();

    expect(diagram.actors[0].name).toBe('Technicien terrain');
    expect(diagram.useCases[0].name).toBe('Enregistrer un cultivateur');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Enregistrer un cultivateur');
  });

  it('clears the selection from an empty canvas click', () => {
    component.select(diagram.actors[0]);
    component.clearSelection();
    fixture.detectChanges();
    expect(component.selectedElement).toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Cliquez sur un acteur');
  });
});
