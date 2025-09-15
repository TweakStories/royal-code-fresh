import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SwipeUpMenuComponent } from './swipe-up-menu.component';

describe('SwipeUpMenuComponent', () => {
  let component: SwipeUpMenuComponent;
  let fixture: ComponentFixture<SwipeUpMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwipeUpMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SwipeUpMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
