import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterStatsPreviewComponent } from './character-stats-preview.component';

describe('CharacterStatsPreviewComponent', () => {
  let component: CharacterStatsPreviewComponent;
  let fixture: ComponentFixture<CharacterStatsPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterStatsPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterStatsPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
