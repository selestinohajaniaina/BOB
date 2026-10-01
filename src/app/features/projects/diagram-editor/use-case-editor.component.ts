import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BobActor, BobDiagram, BobPositionedElement, BobRelationship, BobUseCase } from './bob-diagram.model';

type BobEditableElement = BobActor | BobUseCase;

@Component({
  selector: 'app-use-case-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './use-case-editor.component.html'
})
export class UseCaseEditorComponent {
  @Input({ required: true }) diagram!: BobDiagram;
  @ViewChild('canvas', { static: true }) private canvas!: ElementRef<SVGSVGElement>;

  selectedId: string | null = null;
  draftName = '';
  private dragState: { id: string; pointerId: number; offsetX: number; offsetY: number } | null = null;

  get canvasHeight(): number {
    return Math.max(520, this.diagram.actors.length * 150 + 110, this.diagram.useCases.length * 140 + 100);
  }

  element(id: string): BobPositionedElement | undefined {
    return [...this.diagram.actors, ...this.diagram.useCases].find((element) => element.id === id);
  }

  get selectedElement(): BobEditableElement | null {
    if (!this.selectedId) return null;
    return this.editableElement(this.selectedId) ?? null;
  }

  select(element: BobEditableElement): void {
    this.selectedId = element.id;
    this.draftName = element.name;
  }

  clearSelection(): void {
    this.selectedId = null;
    this.draftName = '';
  }

  startDrag(event: PointerEvent, element: BobEditableElement): void {
    event.preventDefault();
    event.stopPropagation();
    this.select(element);
    const point = this.pointerPosition(event);
    this.dragState = { id: element.id, pointerId: event.pointerId, offsetX: point.x - element.x, offsetY: point.y - element.y };
    this.canvas.nativeElement.setPointerCapture(event.pointerId);
  }

  moveDrag(event: PointerEvent): void {
    if (!this.dragState || this.dragState.pointerId !== event.pointerId) return;
    const element = this.editableElement(this.dragState.id);
    if (!element) return;
    const point = this.pointerPosition(event);
    const horizontalMargin = element.kind === 'use_case' ? 150 : 55;
    element.x = this.clamp(point.x - this.dragState.offsetX, horizontalMargin, 900 - horizontalMargin);
    element.y = this.clamp(point.y - this.dragState.offsetY, 60, this.canvasHeight - 90);
  }

  endDrag(event: PointerEvent): void {
    if (!this.dragState || this.dragState.pointerId !== event.pointerId) return;
    if (this.canvas.nativeElement.hasPointerCapture(event.pointerId)) this.canvas.nativeElement.releasePointerCapture(event.pointerId);
    this.dragState = null;
  }

  applyName(): void {
    const element = this.selectedElement;
    const name = this.draftName.trim();
    if (!element || !name) return;
    element.name = name;
    this.draftName = name;
  }

  relationshipLabel(relationship: BobRelationship): string {
    if (relationship.type === 'include') return '«include»';
    if (relationship.type === 'extend') return '«extend»';
    return relationship.label?.replace(/[<>]/g, '') ?? '';
  }

  private editableElement(id: string): BobEditableElement | undefined {
    return [...this.diagram.actors, ...this.diagram.useCases].find((element) => element.id === id);
  }

  private pointerPosition(event: PointerEvent): { x: number; y: number } {
    const bounds = this.canvas.nativeElement.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * 900 / bounds.width,
      y: (event.clientY - bounds.top) * this.canvasHeight / bounds.height
    };
  }

  private clamp(value: number, minimum: number, maximum: number): number {
    return Math.round(Math.min(maximum, Math.max(minimum, value)));
  }
}
