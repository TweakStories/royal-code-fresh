import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProductToOrderDialogComponent } from './add-product-to-order-dialog.component';

describe('AddProductToOrderDialogComponent', () => {
  let component: AddProductToOrderDialogComponent;
  let fixture: ComponentFixture<AddProductToOrderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddProductToOrderDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddProductToOrderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
