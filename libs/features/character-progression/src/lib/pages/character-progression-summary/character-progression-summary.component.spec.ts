import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterProgressionSummaryComponent } from './character-progression-summary.component';

describe('CharacterProgressionSummaryComponent', () => {
  let component: CharacterProgressionSummaryComponent;
  let fixture: ComponentFixture<CharacterProgressionSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterProgressionSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterProgressionSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
