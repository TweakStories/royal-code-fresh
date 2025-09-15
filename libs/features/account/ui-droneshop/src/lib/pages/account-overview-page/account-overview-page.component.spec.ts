import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountOverviewPageComponent } from './account-overview-page.component';

describe('AccountOverviewPageComponent', () => {
  let component: AccountOverviewPageComponent;
  let fixture: ComponentFixture<AccountOverviewPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountOverviewPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountOverviewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
