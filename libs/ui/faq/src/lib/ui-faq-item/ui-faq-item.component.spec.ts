import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiFaqItemComponent } from './ui-faq-item.component';

describe('UiFaqItemComponent', () => {
  let component: UiFaqItemComponent;
  let fixture: ComponentFixture<UiFaqItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiFaqItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiFaqItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
