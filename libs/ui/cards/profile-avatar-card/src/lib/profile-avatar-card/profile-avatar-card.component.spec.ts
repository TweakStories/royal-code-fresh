import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileAvatarCardComponent } from './profile-avatar-card.component';

describe('ProfileAvatarCardComponent', () => {
  let component: ProfileAvatarCardComponent;
  let fixture: ComponentFixture<ProfileAvatarCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileAvatarCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileAvatarCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
