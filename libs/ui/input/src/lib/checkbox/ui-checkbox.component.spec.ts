import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiCheckboxComponent } from './ui-checkbox.component';

describe('UiCheckboxComponent', () => {
  let component: UiCheckboxComponent;
  let fixture: ComponentFixture<UiCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiCheckboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
