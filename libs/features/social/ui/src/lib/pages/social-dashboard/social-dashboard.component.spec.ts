import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocialDashboardComponent } from './social-dashboard.component';

describe('SocialDashboardComponent', () => {
  let component: SocialDashboardComponent;
  let fixture: ComponentFixture<SocialDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SocialDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
