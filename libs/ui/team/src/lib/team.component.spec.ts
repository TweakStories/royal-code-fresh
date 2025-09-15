import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamComponent } from './team.component';

describe('TeamComponent', () => {
  let component: TeamComponent;
  let fixture: ComponentFixture<TeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display team members', () => {
    expect(component.teamMembers().length).toBe(4);
    expect(component.teamMembers()[0].name).toBe('Roy van de Wetering');
  });
});