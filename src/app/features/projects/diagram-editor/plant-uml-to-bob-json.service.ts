import { Injectable } from '@angular/core';
import { parseUseCase, type UCRelationship, type UseCaseAst } from 'puml-canvas-js';
import { BobActor, BobDiagram, BobRelationship, BobRelationshipType, BobUseCase } from './bob-diagram.model';

export class PlantUmlConversionError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'PlantUmlConversionError';
  }
}

@Injectable({ providedIn: 'root' })
export class PlantUmlToBobJsonService {
  convert(plantUml: string): BobDiagram {
    if (typeof plantUml !== 'string' || !plantUml.trim()) {
      throw new PlantUmlConversionError('Le code PlantUML est vide.');
    }

    let ast: UseCaseAst;
    try {
      ast = parseUseCase(this.normalizeSpecializedDirectionArrows(plantUml));
    } catch (error) {
      throw new PlantUmlConversionError('Le diagramme PlantUML ne peut pas être analysé.', { cause: error });
    }

    const usedIds = new Set<string>();
    const parserIdToBobId = new Map<string, string>();
    const actorNodes = ast.nodes.filter((node) => node.kind === 'actor');
    const useCaseNodes = ast.nodes.filter((node) => node.kind === 'usecase');

    const actors: BobActor[] = actorNodes.map((node, index) => {
      const id = this.uniqueId(`actor_${this.slug(node.id || node.name)}`, usedIds);
      parserIdToBobId.set(node.id, id);
      return { id, kind: 'actor', name: node.name, x: 120, y: 110 + index * 150 };
    });
    const useCases: BobUseCase[] = useCaseNodes.map((node, index) => {
      const id = this.uniqueId(`usecase_${this.slug(node.id || node.name)}`, usedIds);
      parserIdToBobId.set(node.id, id);
      return { id, kind: 'use_case', name: node.name, x: 480, y: 100 + index * 140 };
    });

    if (!actors.length && !useCases.length) {
      throw new PlantUmlConversionError('Aucun acteur ou cas d’utilisation pris en charge n’a été trouvé.');
    }

    const relationships = ast.relationships.flatMap((relationship, index) => {
      const from = parserIdToBobId.get(relationship.source);
      const to = parserIdToBobId.get(relationship.target);
      if (!from || !to) return [];
      const type = this.relationshipType(relationship);
      const item: BobRelationship = {
        id: `relation_${index + 1}_${from}_${to}`,
        from,
        to,
        type
      };
      if (relationship.label) item.label = relationship.label;
      return [item];
    });

    return { version: 1, type: 'use_case', actors, useCases, relationships };
  }

  private relationshipType(relationship: UCRelationship): BobRelationshipType {
    const label = relationship.label.toLowerCase().replace(/[<>]/g, '').trim();
    if (label.includes('include')) return 'include';
    if (label.includes('extend')) return 'extend';
    if (relationship.targetMarker === 'triangle' || relationship.sourceMarker === 'triangle') return 'generalization';
    if (relationship.style === 'dashed') return 'dependency';
    return 'association';
  }

  private normalizeSpecializedDirectionArrows(plantUml: string): string {
    const specializedLabel = /:\s*<<\s*(?:includes?|extends?)\s*>>\s*$/i;
    const dottedDirection = /(?:<\.|\.)(?:left|right|up|down|l|r|u|d)\.(?:>)?/i;
    return plantUml.split(/\r?\n/).map((line) => {
      if (!specializedLabel.test(line) || !dottedDirection.test(line)) return line;
      return line.replace(dottedDirection, '..>');
    }).join('\n');
  }

  private uniqueId(base: string, usedIds: Set<string>): string {
    let id = base || 'element';
    let suffix = 2;
    while (usedIds.has(id)) id = `${base}_${suffix++}`;
    usedIds.add(id);
    return id;
  }

  private slug(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'element';
  }
}
