import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatUiChallengerComponent } from './chat-ui-challenger.component';

describe('ChatUiChallengerComponent', () => {
  let component: ChatUiChallengerComponent;
  let fixture: ComponentFixture<ChatUiChallengerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatUiChallengerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatUiChallengerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
