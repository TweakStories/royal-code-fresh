import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconTextRowComponent } from './icon-text-row.component';

describe('IconTextRowComponent', () => {
  let component: IconTextRowComponent;
  let fixture: ComponentFixture<IconTextRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconTextRowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconTextRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
