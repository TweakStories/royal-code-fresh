import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUsersFacade } from '@royal-code/features/admin-users/core';
import { CreateUserPayload } from '@royal-code/features/admin-users/domain';
import { UserFormComponent } from '../../components/user-form/user-form.component';

@Component({
  selector: 'admin-user-create-page',
  standalone: true,
  imports: [CommonModule, UserFormComponent],
  template: `
    @if(vm(); as viewModel) {
      <admin-user-form [viewModel]="viewModel" (save)="onCreate($event)" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCreatePageComponent implements OnInit { // << DE FIX: Implement OnInit
  protected readonly facade = inject(AdminUsersFacade);
  protected readonly vm = this.facade.viewModel;

  ngOnInit(): void { // << DE FIX: Voeg ngOnInit toe
    this.facade.initPage(); // << DE FIX: Initialiseer de pagina om rollen te laden
  }

  onCreate(payload: any): void {
    this.facade.createUser(payload as CreateUserPayload);
  }
}