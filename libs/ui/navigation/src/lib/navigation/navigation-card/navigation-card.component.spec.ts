import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationCardComponent } from './navigation-card.component';

describe('NavigationCardComponent', () => {
  let component: NavigationCardComponent;
  let fixture: ComponentFixture<NavigationCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
