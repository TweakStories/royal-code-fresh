import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyWishlistPageComponent } from './my-wishlist-page.component';

describe('MyWishlistPageComponent', () => {
  let component: MyWishlistPageComponent;
  let fixture: ComponentFixture<MyWishlistPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyWishlistPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyWishlistPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
