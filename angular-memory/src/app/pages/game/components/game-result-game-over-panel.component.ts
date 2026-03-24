import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ThemeId } from '../themes/theme.model';

@Component({
  selector: 'app-game-result-game-over-panel',
  templateUrl: './game-result-game-over-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameResultGameOverPanelComponent {
  readonly theme = input.required<ThemeId>();
  readonly resultThemeLabelImage = input<string | null>(null);
  readonly gameOverBlueScoreImage = input.required<string>();
  readonly gameOverOrangeScoreImage = input.required<string>();
  readonly blueScore = input.required<number>();
  readonly orangeScore = input.required<number>();
}
