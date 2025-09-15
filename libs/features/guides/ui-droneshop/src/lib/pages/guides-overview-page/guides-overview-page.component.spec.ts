import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuidesOverviewPageComponent } from './guides-overview-page.component';

describe('GuidesOverviewPageComponent', () => {
  let component: GuidesOverviewPageComponent;
  let fixture: ComponentFixture<GuidesOverviewPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuidesOverviewPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuidesOverviewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
