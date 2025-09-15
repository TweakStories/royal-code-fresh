import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaUiChallengerComponent } from './media-ui-challenger.component';

describe('MediaUiChallengerComponent', () => {
  let component: MediaUiChallengerComponent;
  let fixture: ComponentFixture<MediaUiChallengerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaUiChallengerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaUiChallengerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
