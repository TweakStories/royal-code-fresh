import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SirenF35BuildKitDetailComponent } from './siren-f35-build-kit-detail.component';

describe('SirenF35BuildKitDetailComponent', () => {
  let component: SirenF35BuildKitDetailComponent;
  let fixture: ComponentFixture<SirenF35BuildKitDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SirenF35BuildKitDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SirenF35BuildKitDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
