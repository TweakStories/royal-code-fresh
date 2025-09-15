import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiProfileImageComponent } from './ui-profile-image.component';

describe('UiProfileImageComponent', () => {
  let component: UiProfileImageComponent;
  let fixture: ComponentFixture<UiProfileImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiProfileImageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiProfileImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
