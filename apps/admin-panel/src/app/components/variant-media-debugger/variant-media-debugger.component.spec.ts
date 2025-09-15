import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantMediaDebuggerComponent } from './variant-media-debugger.component';

describe('VariantMediaDebuggerComponent', () => {
  let component: VariantMediaDebuggerComponent;
  let fixture: ComponentFixture<VariantMediaDebuggerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariantMediaDebuggerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VariantMediaDebuggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
