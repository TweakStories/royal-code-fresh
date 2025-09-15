import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiVerticalNavComponent } from './ui-vertical-nav.component';

describe('UiVerticalNavComponent', () => {
  let component: UiVerticalNavComponent;
  let fixture: ComponentFixture<UiVerticalNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiVerticalNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiVerticalNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
