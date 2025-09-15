import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiFaqComponent } from './ui-faq.component';

describe('UiFaqComponent', () => {
  let component: UiFaqComponent;
  let fixture: ComponentFixture<UiFaqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiFaqComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
