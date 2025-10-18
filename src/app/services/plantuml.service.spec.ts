import { TestBed } from '@angular/core/testing';

import { PlantumlService } from './plantuml.service';

describe('PlantumlService', () => {
  let service: PlantumlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlantumlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
