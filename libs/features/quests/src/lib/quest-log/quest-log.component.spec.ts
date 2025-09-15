import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestLogComponent } from './quest-log.component';

describe('QuestLogComponent', () => {
  let component: QuestLogComponent;
  let fixture: ComponentFixture<QuestLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestLogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
