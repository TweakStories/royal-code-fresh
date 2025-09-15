import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarCustomizationComponent } from './avatar-customization.component';

describe('AvatarCustomizationComponent', () => {
  let component: AvatarCustomizationComponent;
  let fixture: ComponentFixture<AvatarCustomizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarCustomizationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarCustomizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
