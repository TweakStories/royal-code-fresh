import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorLogPanelComponent } from './error-log-panel.component';

describe('ErrorLogPanelComponent', () => {
  let component: ErrorLogPanelComponent;
  let fixture: ComponentFixture<ErrorLogPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorLogPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorLogPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
