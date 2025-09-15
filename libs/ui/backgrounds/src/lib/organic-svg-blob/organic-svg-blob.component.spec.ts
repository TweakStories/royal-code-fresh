import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganicSvgBlobComponent } from './organic-svg-blob.component';

describe('OrganicSvgBlobComponent', () => {
  let component: OrganicSvgBlobComponent;
  let fixture: ComponentFixture<OrganicSvgBlobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganicSvgBlobComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganicSvgBlobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
