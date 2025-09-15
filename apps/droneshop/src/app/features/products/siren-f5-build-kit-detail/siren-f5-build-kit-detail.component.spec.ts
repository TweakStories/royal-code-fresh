import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SirenF5BuildKitDetailComponent } from './siren-f5-build-kit-detail.component';

describe('SirenF5BuildKitDetailComponent', () => {
  let component: SirenF5BuildKitDetailComponent;
  let fixture: ComponentFixture<SirenF5BuildKitDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SirenF5BuildKitDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SirenF5BuildKitDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
