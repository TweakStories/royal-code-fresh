import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwaggerTestPageComponent } from './swagger-test-page.component';

describe('SwaggerTestPageComponent', () => {
  let component: SwaggerTestPageComponent;
  let fixture: ComponentFixture<SwaggerTestPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwaggerTestPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwaggerTestPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
