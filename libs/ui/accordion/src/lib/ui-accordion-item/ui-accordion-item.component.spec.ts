import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiAccordionItemComponent } from './ui-accordion-item.component';

describe('UiAccordionItemComponent', () => {
  let component: UiAccordionItemComponent;
  let fixture: ComponentFixture<UiAccordionItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiAccordionItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiAccordionItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
