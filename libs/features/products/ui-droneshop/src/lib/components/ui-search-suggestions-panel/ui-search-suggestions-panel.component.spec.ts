import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiSearchSuggestionsPanelComponent } from './ui-search-suggestions-panel.component';

describe('UiSearchSuggestionsPanelComponent', () => {
  let component: UiSearchSuggestionsPanelComponent;
  let fixture: ComponentFixture<UiSearchSuggestionsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiSearchSuggestionsPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiSearchSuggestionsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
