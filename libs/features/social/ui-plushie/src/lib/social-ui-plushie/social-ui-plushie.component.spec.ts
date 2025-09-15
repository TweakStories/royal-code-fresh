import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocialUiPlushieComponent } from './social-ui-plushie.component';

describe('SocialUiPlushieComponent', () => {
  let component: SocialUiPlushieComponent;
  let fixture: ComponentFixture<SocialUiPlushieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialUiPlushieComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SocialUiPlushieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
