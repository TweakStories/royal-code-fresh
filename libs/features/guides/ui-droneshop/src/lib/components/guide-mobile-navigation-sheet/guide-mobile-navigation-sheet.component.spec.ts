import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuideMobileNavigationSheetComponent } from './guide-mobile-navigation-sheet.component';

describe('GuideMobileNavigationSheetComponent', () => {
  let component: GuideMobileNavigationSheetComponent;
  let fixture: ComponentFixture<GuideMobileNavigationSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuideMobileNavigationSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuideMobileNavigationSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
