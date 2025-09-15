import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiMobileNavModalComponent } from './ui-mobile-nav-modal.component';

describe('UiMobileNavModalComponent', () => {
  let component: UiMobileNavModalComponent;
  let fixture: ComponentFixture<UiMobileNavModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiMobileNavModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiMobileNavModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
