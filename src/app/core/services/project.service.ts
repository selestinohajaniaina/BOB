import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Project { id: number; name: string; description: string | null; createdAt: string; updatedAt: string; }
export interface ProjectPayload { name: string; description?: string; }
interface ProjectsResponse { projects: Project[]; }
interface ProjectResponse { message?: string; project: Project; }

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly url = `${environment.apiUrl}/projects`;
  constructor(private readonly http: HttpClient) {}
  getProjects(): Observable<ProjectsResponse> { return this.http.get<ProjectsResponse>(this.url); }
  getProject(id: number): Observable<ProjectResponse> { return this.http.get<ProjectResponse>(`${this.url}/${id}`); }
  createProject(data: ProjectPayload): Observable<ProjectResponse> { return this.http.post<ProjectResponse>(this.url, data); }
  updateProject(id: number, data: ProjectPayload): Observable<ProjectResponse> { return this.http.patch<ProjectResponse>(`${this.url}/${id}`, data); }
  deleteProject(id: number): Observable<{ message: string }> { return this.http.delete<{ message: string }>(`${this.url}/${id}`); }
}
