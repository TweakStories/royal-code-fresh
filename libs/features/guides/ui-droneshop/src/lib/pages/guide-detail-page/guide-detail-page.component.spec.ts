import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuideDetailPageComponent } from './guide-detail-page.component';

describe('GuideDetailPageComponent', () => {
  let component: GuideDetailPageComponent;
  let fixture: ComponentFixture<GuideDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuideDetailPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuideDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
