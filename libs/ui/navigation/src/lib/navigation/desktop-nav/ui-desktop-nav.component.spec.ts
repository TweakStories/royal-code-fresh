import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiDesktopNavComponent } from './ui-desktop-nav.component';

describe('UiDesktopNavComponent', () => {
  let component: UiDesktopNavComponent;
  let fixture: ComponentFixture<UiDesktopNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiDesktopNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiDesktopNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
