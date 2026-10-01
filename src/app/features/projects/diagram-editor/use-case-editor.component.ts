import { Component, Input } from '@angular/core';
import { BobDiagram, BobPositionedElement, BobRelationship } from './bob-diagram.model';

@Component({
  selector: 'app-use-case-editor',
  standalone: true,
  templateUrl: './use-case-editor.component.html'
})
export class UseCaseEditorComponent {
  @Input({ required: true }) diagram!: BobDiagram;

  get canvasHeight(): number {
    const elements = [...this.diagram.actors, ...this.diagram.useCases];
    return Math.max(520, ...elements.map((element) => element.y + 100));
  }

  element(id: string): BobPositionedElement | undefined {
    return [...this.diagram.actors, ...this.diagram.useCases].find((element) => element.id === id);
  }

  relationshipLabel(relationship: BobRelationship): string {
    if (relationship.type === 'include') return '«include»';
    if (relationship.type === 'extend') return '«extend»';
    return relationship.label?.replace(/[<>]/g, '') ?? '';
  }
}
