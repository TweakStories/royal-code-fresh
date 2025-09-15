import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataflowDiagramComponent } from './dataflow-diagram.component';

describe('DataflowDiagramComponent', () => {
  let component: DataflowDiagramComponent;
  let fixture: ComponentFixture<DataflowDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataflowDiagramComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataflowDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
