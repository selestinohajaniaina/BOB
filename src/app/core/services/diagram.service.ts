import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Diagram {
  id: number;
  projectId: number;
  name: string;
  type: 'use_case';
  prompt: string;
  plantUml: string;
  createdAt: string;
  updatedAt: string;
}

interface DiagramResponse { message?: string; diagram: Diagram; }
interface DiagramsResponse { diagrams: Diagram[]; }

@Injectable({ providedIn: 'root' })
export class DiagramService {
  private readonly projectsUrl = `${environment.apiUrl}/projects`;
  constructor(private readonly http: HttpClient) {}
  getDiagrams(projectId: number): Observable<DiagramsResponse> { return this.http.get<DiagramsResponse>(`${this.projectsUrl}/${projectId}/diagrams`); }
  generateUseCase(projectId: number, prompt: string): Observable<DiagramResponse> { return this.http.post<DiagramResponse>(`${this.projectsUrl}/${projectId}/diagrams`, { type: 'use_case', prompt }); }
  deleteDiagram(projectId: number, diagramId: number): Observable<{ message: string }> { return this.http.delete<{ message: string }>(`${this.projectsUrl}/${projectId}/diagrams/${diagramId}`); }
}
