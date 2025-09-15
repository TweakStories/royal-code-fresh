import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NodeOverviewMapComponent } from './node-overview-map.component';

describe('NodeOverviewMapComponent', () => {
  let component: NodeOverviewMapComponent;
  let fixture: ComponentFixture<NodeOverviewMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeOverviewMapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NodeOverviewMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
