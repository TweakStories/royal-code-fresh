import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SirenF35DetailComponent } from './siren-f35-detail.component';

describe('SirenF35DetailComponent', () => {
  let component: SirenF35DetailComponent;
  let fixture: ComponentFixture<SirenF35DetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SirenF35DetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SirenF35DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
