import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryEquipmentComponent } from './inventory-equipment.component';

describe('InventoryEquipmentComponent', () => {
  let component: InventoryEquipmentComponent;
  let fixture: ComponentFixture<InventoryEquipmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryEquipmentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryEquipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
