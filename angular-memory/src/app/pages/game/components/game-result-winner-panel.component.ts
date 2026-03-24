import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeId } from '../themes/theme.model';

@Component({
  selector: 'app-game-result-winner-panel',
  imports: [RouterLink],
  templateUrl: './game-result-winner-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameResultWinnerPanelComponent {
  readonly theme = input.required<ThemeId>();
  readonly shouldShowWinnerConfetti = input.required<boolean>();
  readonly confettiImage = input.required<string>();
  readonly resultThemeLabelImage = input<string | null>(null);
  readonly winnerTitleClass = input.required<string>();
  readonly winnerTitle = input.required<string>();
  readonly winnerSymbolImage = input<string | null>(null);
  readonly winnerSymbolClass = input.required<string>();
  readonly winnerBackButtonLabel = input.required<string>();
  readonly playAgainClicked = output<void>();
  readonly confettiImageError = output<void>();

  protected onConfettiImageError(): void {
    this.confettiImageError.emit();
  }

  protected onPlayAgainClick(): void {
    this.playAgainClicked.emit();
  }
}
