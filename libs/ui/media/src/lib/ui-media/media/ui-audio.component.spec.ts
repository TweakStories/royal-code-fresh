import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiAudioComponent } from './ui-audio.component';

describe('UiAudioComponent', () => {
  let component: UiAudioComponent;
  let fixture: ComponentFixture<UiAudioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiAudioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiAudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
