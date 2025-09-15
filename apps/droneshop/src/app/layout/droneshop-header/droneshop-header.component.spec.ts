import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CvHeaderComponent } from './drone-header.component';

describe('CvHeaderComponent', () => {
  let component: CvHeaderComponent;
  let fixture: ComponentFixture<CvHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CvHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CvHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
