import { TestBed } from '@angular/core/testing';
import { PlantUmlToBobJsonService } from './plant-uml-to-bob-json.service';

describe('PlantUmlToBobJsonService', () => {
  let service: PlantUmlToBobJsonService;

  beforeEach(() => service = TestBed.inject(PlantUmlToBobJsonService));

  it('converts actors, use cases and relationships to stable BOB JSON', () => {
    const source = `@startuml
left to right direction
actor Utilisateur as user
actor Administrateur as admin
rectangle BOB {
  usecase "Se connecter" as login
  usecase "Gérer les projets" as projects
  usecase "Gérer les utilisateurs" as users
}
user --> login
user --> projects
admin --> login
admin --> users
login ..> users : <<include>>
@enduml`;

    const first = service.convert(source);
    const second = service.convert(source);

    expect(first).toEqual(second);
    expect(first.version).toBe(1);
    expect(first.type).toBe('use_case');
    expect(first.actors.map((actor) => [actor.id, actor.name])).toEqual([
      ['actor_user', 'Utilisateur'],
      ['actor_admin', 'Administrateur']
    ]);
    expect(first.useCases.map((useCase) => [useCase.id, useCase.name])).toEqual([
      ['usecase_login', 'Se connecter'],
      ['usecase_projects', 'Gérer les projets'],
      ['usecase_users', 'Gérer les utilisateurs']
    ]);
    expect(first.relationships.length).toBe(5);
    expect(first.relationships[0]).toEqual(jasmine.objectContaining({ from: 'actor_user', to: 'usecase_login', type: 'association' }));
    expect(first.relationships[4]).toEqual(jasmine.objectContaining({ from: 'usecase_login', to: 'usecase_users', type: 'include' }));
    expect(first.actors.every((actor) => Number.isFinite(actor.x) && Number.isFinite(actor.y))).toBeTrue();
    expect(first.useCases.every((useCase) => Number.isFinite(useCase.x) && Number.isFinite(useCase.y))).toBeTrue();
  });

  it('keeps 23 associations and converts directional include and extend relations', () => {
    const source = `@startuml
left to right direction
actor "Administrateur" as Admin
actor "Agent" as Agent
actor "Cultivateur" as Cultivateur
actor "Visiteur" as Visiteur
rectangle BOB {
  usecase "Consulter une fiche" as UC_ConsulterFiche
  usecase "Rechercher un cultivateur" as UC_RechercherCultivateur
  usecase "Gérer les comptes administrateur" as UC_GererComptesAdmin
  usecase "Gérer les utilisateurs" as UC_GererUtilisateurs
  usecase "Créer un projet" as UC_CreerProjet
  usecase "Modifier un projet" as UC_ModifierProjet
  usecase "Supprimer un projet" as UC_SupprimerProjet
  usecase "Consulter les projets" as UC_ConsulterProjets
  usecase "Générer un diagramme" as UC_GenererDiagramme
  usecase "Consulter un diagramme" as UC_ConsulterDiagramme
  usecase "Supprimer un diagramme" as UC_SupprimerDiagramme
}
Admin --> UC_ConsulterFiche
Admin --> UC_RechercherCultivateur
Admin --> UC_GererComptesAdmin
Admin --> UC_GererUtilisateurs
Admin --> UC_CreerProjet
Admin --> UC_ModifierProjet
Admin --> UC_SupprimerProjet
Admin --> UC_ConsulterProjets
Admin --> UC_GenererDiagramme
Admin --> UC_ConsulterDiagramme
Admin --> UC_SupprimerDiagramme
Agent --> UC_ConsulterFiche
Agent --> UC_RechercherCultivateur
Agent --> UC_CreerProjet
Agent --> UC_ModifierProjet
Agent --> UC_ConsulterProjets
Agent --> UC_GenererDiagramme
Cultivateur --> UC_ConsulterFiche
Cultivateur --> UC_RechercherCultivateur
Cultivateur --> UC_ConsulterProjets
Visiteur --> UC_ConsulterFiche
Visiteur --> UC_RechercherCultivateur
Visiteur --> UC_ConsulterProjets
UC_ConsulterFiche <.up. UC_RechercherCultivateur : <<includes>>
UC_GererComptesAdmin .up.> UC_GererUtilisateurs : <<extends>>
@enduml`;

    const diagram = service.convert(source);
    const associations = diagram.relationships.filter((relationship) => relationship.type === 'association');
    const includes = diagram.relationships.filter((relationship) => relationship.type === 'include');
    const extendsRelations = diagram.relationships.filter((relationship) => relationship.type === 'extend');

    expect(diagram.actors.length).toBe(4);
    expect(diagram.useCases.length).toBe(11);
    expect(diagram.relationships.length).toBe(25);
    expect(associations.length).toBe(23);
    expect(includes).toEqual([
      jasmine.objectContaining({
        from: 'usecase_uc_consulterfiche',
        to: 'usecase_uc_recherchercultivateur',
        type: 'include'
      })
    ]);
    expect(extendsRelations).toEqual([
      jasmine.objectContaining({
        from: 'usecase_uc_gerercomptesadmin',
        to: 'usecase_uc_gererutilisateurs',
        type: 'extend'
      })
    ]);
  });
});
