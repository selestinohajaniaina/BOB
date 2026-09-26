import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProjectService } from './project.service';
import { environment } from '../../../environments/environment';

describe('ProjectService', () => {
  let service: ProjectService;
  let http: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }); service = TestBed.inject(ProjectService); http = TestBed.inject(HttpTestingController); });
  afterEach(() => http.verify());
  it('uses the authenticated projects API for CRUD operations', () => {
    service.getProjects().subscribe(); http.expectOne(`${environment.apiUrl}/projects`).flush({ projects: [] });
    service.getProject(7).subscribe(); http.expectOne(`${environment.apiUrl}/projects/7`).flush({ project: {} });
    service.createProject({ name: 'Projet' }).subscribe(); const create = http.expectOne(`${environment.apiUrl}/projects`); expect(create.request.method).toBe('POST'); create.flush({ project: {} });
    service.updateProject(7, { name: 'Projet modifié' }).subscribe(); const update = http.expectOne(`${environment.apiUrl}/projects/7`); expect(update.request.method).toBe('PATCH'); update.flush({ project: {} });
    service.deleteProject(7).subscribe(); const remove = http.expectOne(`${environment.apiUrl}/projects/7`); expect(remove.request.method).toBe('DELETE'); remove.flush({ message: 'ok' });
  });
});
