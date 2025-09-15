import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUserFilterComponent } from './admin-user-filter.component';

describe('AdminUserFilterComponent', () => {
  let component: AdminUserFilterComponent;
  let fixture: ComponentFixture<AdminUserFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUserFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUserFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
