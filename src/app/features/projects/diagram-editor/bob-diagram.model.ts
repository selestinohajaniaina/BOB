export type BobDiagramType = 'use_case';

export interface BobPositionedElement {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface BobActor extends BobPositionedElement {
  kind: 'actor';
}

export interface BobUseCase extends BobPositionedElement {
  kind: 'use_case';
}

export type BobRelationshipType = 'association' | 'include' | 'extend' | 'generalization' | 'dependency';

export interface BobRelationship {
  id: string;
  from: string;
  to: string;
  type: BobRelationshipType;
  label?: string;
}

export interface BobDiagram {
  version: 1;
  type: BobDiagramType;
  actors: BobActor[];
  useCases: BobUseCase[];
  relationships: BobRelationship[];
}
