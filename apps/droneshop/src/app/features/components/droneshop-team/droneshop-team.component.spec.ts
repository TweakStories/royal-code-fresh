import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DroneshopTeamComponent } from './droneshop-team.component';

describe('DroneshopTeamComponent', () => {
  let component: DroneshopTeamComponent;
  let fixture: ComponentFixture<DroneshopTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DroneshopTeamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DroneshopTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
