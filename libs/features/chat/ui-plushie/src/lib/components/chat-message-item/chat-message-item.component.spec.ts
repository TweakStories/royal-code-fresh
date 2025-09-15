import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMessageItemComponent } from './chat-message-item.component';

describe('ChatMessageItemComponent', () => {
  let component: ChatMessageItemComponent;
  let fixture: ComponentFixture<ChatMessageItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatMessageItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatMessageItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
