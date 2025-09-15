import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaDataAccessChallengerComponent } from './media-data-access-challenger.component';

describe('MediaDataAccessChallengerComponent', () => {
  let component: MediaDataAccessChallengerComponent;
  let fixture: ComponentFixture<MediaDataAccessChallengerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaDataAccessChallengerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaDataAccessChallengerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
