import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private code!: string;
  constructor(private http: HttpClient) { }

  private getDiagramPrompt(projectDescription: string, type: 'class' | 'useCase' | 'activity', useCaseCode: string, classCode: string): string {
    switch (type) {
      case 'class':
        return `Génère le code PlantUML du diagramme de classes pour "${projectDescription}", en te basant sur : "${useCaseCode}".
                Inclue pour chaque classe : attributs ET méthodes.
                Retourne uniquement le code entre @startuml et @enduml , sans texte ni explication et sans erreur de syntaxe.`

      case 'useCase':
        return `Crée un diagramme de cas d'utilisation UML en syntaxe PlantUML pour : "${projectDescription}".
                Donne uniquement le code entre @startuml et @enduml, sans explication ni texte supplémentaire et sans erreur de syntaxe.`
    
      case 'activity':
        return `Génère uniquement le code PlantUML du diagramme d’activités pour "${projectDescription}", 
                en te basant sur le diagramme de cas d’utilisation : "${useCaseCode}" 
                et le diagramme de classes : "${classCode}". 
                Ne retourne que le code entre @startuml et @enduml, sans texte ni explication et sans erreur de syntaxe.`
    }
  }

  getPlantUmlCode(projectDescription: string, type: 'class' | 'useCase' | 'activity', useCaseCode: string = '', classCode: string = '') {
    return this.http.post(environment.geminiApiUrl, {
        contents: [
          {
            parts: [
              {
                text: this.getDiagramPrompt(projectDescription, type, useCaseCode, classCode)
              }
            ]
          }
        ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': environment.geminiApiKei
      }
    });
  }

}
