import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CvFooterComponent } from './cv-footer.component';

describe('CvFooterComponent', () => {
  let component: CvFooterComponent;
  let fixture: ComponentFixture<CvFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CvFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CvFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
