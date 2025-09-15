import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedInputComponent } from './feed-input.component';

describe('FeedInputComponent', () => {
  let component: FeedInputComponent;
  let fixture: ComponentFixture<FeedInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
