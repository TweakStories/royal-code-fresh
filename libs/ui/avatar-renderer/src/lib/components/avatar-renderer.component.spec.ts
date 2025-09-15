import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarRendererComponent } from './avatar-renderer.component';

describe('AvatarRendererComponent', () => {
  let component: AvatarRendererComponent;
  let fixture: ComponentFixture<AvatarRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarRendererComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
