import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiParagraphComponent } from './ui-paragraph.component';

describe('UiParagraphComponent', () => {
  let component: UiParagraphComponent;
  let fixture: ComponentFixture<UiParagraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiParagraphComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiParagraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
