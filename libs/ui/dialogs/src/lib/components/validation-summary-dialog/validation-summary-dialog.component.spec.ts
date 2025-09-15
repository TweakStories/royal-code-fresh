import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationSummaryDialogComponent } from './validation-summary-dialog.component';

describe('ValidationSummaryDialogComponent', () => {
  let component: ValidationSummaryDialogComponent;
  let fixture: ComponentFixture<ValidationSummaryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationSummaryDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidationSummaryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
