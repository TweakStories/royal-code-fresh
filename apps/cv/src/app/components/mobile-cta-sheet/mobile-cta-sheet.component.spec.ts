import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileCtaSheetComponent } from './mobile-cta-sheet.component';

describe('MobileCtaSheetComponent', () => {
  let component: MobileCtaSheetComponent;
  let fixture: ComponentFixture<MobileCtaSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileCtaSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileCtaSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
