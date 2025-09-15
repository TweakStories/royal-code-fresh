import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuideNavigationComponent } from './guide-navigation.component';

describe('GuideNavigationComponent', () => {
  let component: GuideNavigationComponent;
  let fixture: ComponentFixture<GuideNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuideNavigationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuideNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
