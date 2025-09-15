import { Component, input } from '@angular/core';


@Component({
    selector: 'royal-code-leaderboard',
    imports: [],
    templateUrl: './leaderboard.component.html',
    styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent {
  readonly entries = input.required<any[]>();
}
