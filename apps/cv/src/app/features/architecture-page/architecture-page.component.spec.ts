import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchitecturePageComponent } from './architecture-page.component';

describe('ArchitecturePageComponent', () => {
  let component: ArchitecturePageComponent;
  let fixture: ComponentFixture<ArchitecturePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchitecturePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchitecturePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
