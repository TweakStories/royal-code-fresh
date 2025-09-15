import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentBlockDispatcherComponent } from './content-block-dispatcher.component';

describe('ContentBlockDispatcherComponent', () => {
  let component: ContentBlockDispatcherComponent;
  let fixture: ComponentFixture<ContentBlockDispatcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentBlockDispatcherComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentBlockDispatcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
