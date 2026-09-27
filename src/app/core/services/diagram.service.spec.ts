import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { DiagramService } from './diagram.service';

describe('DiagramService', () => {
  let service: DiagramService; let http: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }); service = TestBed.inject(DiagramService); http = TestBed.inject(HttpTestingController); });
  afterEach(() => http.verify());
  it('uses only the protected BOB backend API', () => {
    const root = `${environment.apiUrl}/projects/3/diagrams`;
    service.getDiagrams(3).subscribe(); const request = http.expectOne(root); expect(request.request.method).toBe('GET'); request.flush({ diagrams: [] }); http.expectNone((req) => req.url.includes('generativelanguage'));
  });
  it('generates a use case diagram through BOB', () => {
    service.generateUseCase(3, 'Montrer les acteurs').subscribe();
    const request = http.expectOne(`${environment.apiUrl}/projects/3/diagrams`);
    expect(request.request.method).toBe('POST'); expect(request.request.body).toEqual({ type: 'use_case', prompt: 'Montrer les acteurs' });
    request.flush({ diagram: {} });
  });
});
