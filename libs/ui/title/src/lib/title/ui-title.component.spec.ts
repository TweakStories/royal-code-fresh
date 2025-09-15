import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiTitleComponent } from '../../../../src/lib/ui-elements/ui-title/ui-title.component';

describe('UiTitleComponent', () => {
  let component: UiTitleComponent;
  let fixture: ComponentFixture<UiTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiTitleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
