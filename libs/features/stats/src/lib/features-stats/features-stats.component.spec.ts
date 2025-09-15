import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeaturesStatsComponent } from './features-stats.component';

describe('FeaturesStatsComponent', () => {
  let component: FeaturesStatsComponent;
  let fixture: ComponentFixture<FeaturesStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturesStatsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturesStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
