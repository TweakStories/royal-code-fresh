import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleManagementPageComponent } from './role-management-page.component';

describe('RoleManagementPageComponent', () => {
  let component: RoleManagementPageComponent;
  let fixture: ComponentFixture<RoleManagementPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleManagementPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleManagementPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
