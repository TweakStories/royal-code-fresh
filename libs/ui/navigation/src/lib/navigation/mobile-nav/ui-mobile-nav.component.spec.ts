import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiMobileNavComponent } from './ui-mobile-nav.component';

describe('UiMobileNavComponent', () => {
  let component: UiMobileNavComponent;
  let fixture: ComponentFixture<UiMobileNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiMobileNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiMobileNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
