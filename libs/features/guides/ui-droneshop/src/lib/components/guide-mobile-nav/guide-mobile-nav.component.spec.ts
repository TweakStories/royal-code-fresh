import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuideMobileNavComponent } from './guide-mobile-nav.component';

describe('GuideMobileNavComponent', () => {
  let component: GuideMobileNavComponent;
  let fixture: ComponentFixture<GuideMobileNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuideMobileNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuideMobileNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
