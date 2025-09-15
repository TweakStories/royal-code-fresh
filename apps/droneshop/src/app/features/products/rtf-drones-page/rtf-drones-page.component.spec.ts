import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtfDronesPageComponent } from './rtf-drones-page.component';

describe('RtfDronesPageComponent', () => {
  let component: RtfDronesPageComponent;
  let fixture: ComponentFixture<RtfDronesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RtfDronesPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RtfDronesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
