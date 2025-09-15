import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAddressesPageComponent } from './my-addresses-page.component';

describe('MyAddressesPageComponent', () => {
  let component: MyAddressesPageComponent;
  let fixture: ComponentFixture<MyAddressesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyAddressesPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyAddressesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
