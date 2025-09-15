/**
 * @file profile.component.ts
 * @version 1.1.0 (Corrected UiImageComponent Bindings)
 * @author Royal-Code MonorepoAppDevAI
 * @description Renders a user profile summary card.
 */
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Profile } from '@royal-code/shared/domain';
import { UiImageComponent } from '@royal-code/ui/media'; // Importeer UiImageComponent van media lib

@Component({
  selector: 'royal-code-profile',
  standalone: true,
  imports: [CommonModule, UiImageComponent, RouterModule],
  template: `
    <a [routerLink]="'/profile/' + profile().id" title="Bekijk profiel" class="flex items-center space-x-3 p-4 hover:opacity-80 transition-opacity">
      @if (profile().avatar) {
        <royal-code-ui-image
          [image]="profile().avatar" 
          [alt]="'Avatar van ' + profile().displayName"
          [rounded]="true"            
          objectFit="cover"
          class="w-12 h-12"
        ></royal-code-ui-image>
      } @else {
        <div class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white">
          {{ profile().displayName.charAt(0) }}
        </div>
      }
      <div class="flex flex-col">
        <div class="font-bold text-lg">{{ profile().displayName }}</div>
        <div class="text-sm text-gray-500">
          @if (profile().level) {
            <span>Level: {{ profile().level }}</span>
          }
          @if (profile().reputation) {
            @if (profile().level) { <span> · </span> }
            <span>Reputation: {{ profile().reputation }}</span>
          }
        </div>
      </div>
    </a>
  `,
})
export class ProfileComponent {
  profile = input.required<Profile>();
}