import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgViewerComponent } from './svg-viewer.component';

describe('SvgViewerComponent', () => {
  let component: SvgViewerComponent;
  let fixture: ComponentFixture<SvgViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SvgViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SvgViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
