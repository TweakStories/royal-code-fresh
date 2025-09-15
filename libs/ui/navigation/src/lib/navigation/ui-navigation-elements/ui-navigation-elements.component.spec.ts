import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiNavigationElementsComponent } from './ui-navigation-elements.component';

describe('UiNavigationElementsComponent', () => {
  let component: UiNavigationElementsComponent;
  let fixture: ComponentFixture<UiNavigationElementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiNavigationElementsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiNavigationElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
