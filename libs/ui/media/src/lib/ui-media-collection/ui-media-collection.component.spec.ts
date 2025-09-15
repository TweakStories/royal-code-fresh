import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiMediaCollectionComponent } from './ui-media-collection.component';

describe('UiMediaCollectionComponent', () => {
  let component: UiMediaCollectionComponent;
  let fixture: ComponentFixture<UiMediaCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiMediaCollectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiMediaCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
