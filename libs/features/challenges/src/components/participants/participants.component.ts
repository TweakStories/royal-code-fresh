import { Component, input } from '@angular/core';

import { LeaderboardComponent } from '../leaderboard/leaderboard.component';
import { Challenge, Participant } from '@royal-code/shared/domain';

@Component({
  selector: 'royal-code-participants',
  imports: [],
  template: `
    <!-- participants.component.html -->
    
    <section class="participants">
      <h2 class="text-2xl font-semibold mt-8 mb-2">
        Participants ({{ participants().length }})
      </h2>
    
      <!-- List of Participants -->
      <ul class="participants-list flex flex-wrap">
        @for (participant of participants(); track participant) {
          <li
            class="w-1/4 p-2"
            >
            <div class="bg-white rounded shadow p-4 text-center">
              <!-- <img [src]="participant.profileImageUrl || defaultAvatar" alt="{{ participant.userName }}" class="rounded-full w-16 h-16 mx-auto" /> -->
              <img
                [src]="participant.profileImageUrl"
                alt="{{ participant.userName }}"
                class="rounded-full w-16 h-16 mx-auto"
                />
                <span class="mt-2 block">{{ participant.userName }}</span>
              </div>
            </li>
          }
        </ul>
    
        <!-- Leaderboard -->
        <h2 class="text-2xl font-semibold mt-8 mb-2">Leaderboard</h2>
      </section>
    `,
})
export class ParticipantsComponent {
  readonly participants = input.required<Participant[]>();
}
