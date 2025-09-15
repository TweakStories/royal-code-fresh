import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterStatsPageComponent } from './character-stats-page.component';

describe('CharacterStatsPageComponent', () => {
  let component: CharacterStatsPageComponent;
  let fixture: ComponentFixture<CharacterStatsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterStatsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterStatsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
