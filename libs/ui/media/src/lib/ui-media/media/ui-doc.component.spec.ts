import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiDocComponent } from './ui-doc.component';

describe('UiDocComponent', () => {
  let component: UiDocComponent;
  let fixture: ComponentFixture<UiDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiDocComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
