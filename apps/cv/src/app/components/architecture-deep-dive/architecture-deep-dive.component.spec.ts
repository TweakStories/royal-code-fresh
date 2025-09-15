import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchitectureDeepDiveComponent } from './architecture-deep-dive.component';

describe('ArchitectureDeepDiveComponent', () => {
  let component: ArchitectureDeepDiveComponent;
  let fixture: ComponentFixture<ArchitectureDeepDiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchitectureDeepDiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchitectureDeepDiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
