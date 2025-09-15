import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiAvatarComponent } from './ai-avatar.component';

describe('AiAvatarComponent', () => {
  let component: AiAvatarComponent;
  let fixture: ComponentFixture<AiAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiAvatarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
