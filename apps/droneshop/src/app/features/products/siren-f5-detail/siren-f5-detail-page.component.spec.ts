import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SirenF5DetailPageComponent } from './siren-f5-detail-page.component';

describe('SirenF5DetailPageComponent', () => {
  let component: SirenF5DetailPageComponent;
  let fixture: ComponentFixture<SirenF5DetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SirenF5DetailPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SirenF5DetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
