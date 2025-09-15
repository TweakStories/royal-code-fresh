import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleManagementDialogComponent } from './role-management-dialog.component';

describe('RoleManagementDialogComponent', () => {
  let component: RoleManagementDialogComponent;
  let fixture: ComponentFixture<RoleManagementDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleManagementDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleManagementDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
