import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterStatsDisplayComponent } from './character-stats-display.component';

describe('CharacterStatsDisplayComponent', () => {
  let component: CharacterStatsDisplayComponent;
  let fixture: ComponentFixture<CharacterStatsDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterStatsDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterStatsDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
