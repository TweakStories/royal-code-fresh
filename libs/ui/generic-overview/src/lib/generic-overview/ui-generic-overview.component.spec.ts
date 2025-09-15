import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiGenericOverviewComponent } from './ui-generic-overview.component';

describe('UiGenericOverviewComponent', () => {
  let component: UiGenericOverviewComponent;
  let fixture: ComponentFixture<UiGenericOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiGenericOverviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiGenericOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
