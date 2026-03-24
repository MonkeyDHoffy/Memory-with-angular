import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GameResultGameOverPanelComponent } from './components/game-result-game-over-panel.component';
import { GameResultWinnerPanelComponent } from './components/game-result-winner-panel.component';
import { HoldKeyShortcut } from './debug/hold-key-shortcut';
import { PlayerId, SymbolDefinition, ThemeId, WinnerId } from './themes/theme.model';
import { DEFAULT_THEME_ID, THEME_CONFIGS, isThemeId } from './themes/theme.registry';
import {
  BoardSizeId,
  MemoryCard,
  createShuffledDeck,
  parseBoardSize,
  parseStartingPlayer,
  pickRandomPlayerWinner,
  resolveWinnerByScore,
} from './utils/game-helpers';

@Component({
  selector: 'app-game',
  imports: [RouterLink, GameResultGameOverPanelComponent, GameResultWinnerPanelComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private hideMismatchTimeoutId: number | null = null;
  private gameOverRevealTimeoutId: number | null = null;
  private symbolPool: SymbolDefinition[] = [];
  private readonly debugWinnerShortcut = new HoldKeyShortcut({
    key: 'w',
    holdDurationMs: 3000,
    shouldTrigger: () => this.gameStage() === 'playing',
    onHoldComplete: () => this.forceFinishGameWithRandomWinner(),
  });

  protected readonly theme = signal<ThemeId>('code-vibes');

  protected readonly boardSize = signal<BoardSizeId>(16);
  protected readonly cards = signal<MemoryCard[]>([]);

  protected readonly backImage = signal('/assets/gamethemes/codevibe/cards/hidden.png');
  protected readonly bluePlayerImage = signal('/assets/gamethemes/codevibe/blue.png');
  protected readonly orangePlayerImage = signal('/assets/gamethemes/codevibe/orange.png');
  protected readonly whitePlayerImage = signal('/assets/gamethemes/gamestheme/white.png');
  protected readonly exitButtonImage = signal('/assets/gamethemes/codevibe/exit.png');
  protected readonly exitButtonHoverImage = signal<string | null>(null);
  protected readonly backButtonImage = signal('/assets/gamethemes/codevibe/back.png');
  protected readonly backButtonHoverImage = signal<string | null>(null);
  protected readonly yesQuitButtonImage = signal<string | null>(null);
  protected readonly yesQuitButtonHoverImage = signal<string | null>(null);
  protected readonly isExitButtonHovered = signal(false);
  protected readonly isBackButtonHovered = signal(false);
  protected readonly isYesQuitButtonHovered = signal(false);
  protected readonly gameStage = signal<'playing' | 'game-over' | 'winner'>('playing');
  protected readonly winner = signal<WinnerId | null>(null);
  protected readonly confettiImage = signal('/assets/gamethemes/codevibe/confetti.png');
  protected readonly trophyImage = signal('/assets/gamethemes/pockal%201.png');
  protected readonly showConfettiImage = signal(true);
  protected readonly showExitDialog = signal(false);
  protected readonly revealedCardIds = signal<Set<number>>(new Set<number>());
  protected readonly matchedCardIds = signal<Set<number>>(new Set<number>());
  protected readonly selectedCardIds = signal<number[]>([]);
  protected readonly isResolvingTurn = signal(false);
  protected readonly startingPlayer = signal<PlayerId>('blue');
  protected readonly currentPlayer = signal<PlayerId>('blue');
  protected readonly blueScore = signal(0);
  protected readonly orangeScore = signal(0);

  private readonly activeThemeConfig = computed(() => THEME_CONFIGS[this.theme()]);
  private readonly activeThemeResult = computed(() => this.activeThemeConfig().result);

  protected readonly currentPlayerSymbol = computed(() => {
    if (this.activeThemeConfig().usesWhiteCurrentPlayerSymbol) {
      return this.whitePlayerImage();
    }

    return this.currentPlayer() === 'blue' ? this.bluePlayerImage() : this.orangePlayerImage();
  });

  protected readonly currentPlayerBadgeClass = computed(
    () => this.activeThemeConfig().header.currentPlayerBadgeClass[this.currentPlayer()],
  );

  protected readonly activeExitButtonImage = computed(() => {
    if (this.isExitButtonHovered() && this.exitButtonHoverImage() !== null) {
      return this.exitButtonHoverImage() as string;
    }
    return this.exitButtonImage();
  });

  protected readonly activeBackButtonImage = computed(() => {
    if (this.isBackButtonHovered() && this.backButtonHoverImage() !== null) {
      return this.backButtonHoverImage() as string;
    }
    return this.backButtonImage();
  });

  protected readonly activeYesQuitButtonImage = computed(() => {
    const baseImage = this.yesQuitButtonImage();
    if (baseImage === null) {
      return null;
    }

    if (this.isYesQuitButtonHovered() && this.yesQuitButtonHoverImage() !== null) {
      return this.yesQuitButtonHoverImage() as string;
    }

    return baseImage;
  });

  protected readonly showResultOverlay = computed(
    () => this.gameStage() !== 'playing',
  );

  protected readonly winnerTitle = computed(() => {
    const currentWinner = this.winner() ?? 'draw';
    return this.activeThemeResult().winnerTitles[currentWinner];
  });

  protected readonly winnerTitleClass = computed(() => {
    const currentWinner = this.winner();

    if (currentWinner === 'blue') {
      return 'winner-title winner-title--blue';
    }

    if (currentWinner === 'orange') {
      return 'winner-title winner-title--orange';
    }

    return 'winner-title winner-title--draw';
  });

  protected readonly winnerSymbolImage = computed(() => {
    const currentWinner = this.winner() ?? 'draw';
    return this.activeThemeResult().winnerSymbols[currentWinner];
  });

  protected readonly winnerSymbolClass = computed(() => this.activeThemeResult().winnerSymbolClass);

  protected readonly winnerBackButtonLabel = computed(() => this.activeThemeResult().winnerBackButtonLabel);
  protected readonly shouldShowWinnerConfetti = computed(() => this.activeThemeResult().showConfetti && this.showConfettiImage());
  protected readonly resultThemeLabelImage = computed(() => this.activeThemeResult().gameOverLabelImage);
  protected readonly gameOverBlueScoreImage = computed(
    () => this.activeThemeResult().gameOverBlueScoreImage ?? this.bluePlayerImage(),
  );
  protected readonly gameOverOrangeScoreImage = computed(
    () => this.activeThemeResult().gameOverOrangeScoreImage ?? this.orangePlayerImage(),
  );

  constructor() {
    this.debugWinnerShortcut.start();
    this.initializeTheme();
    this.applyThemeAssets();
    this.initializeStartingPlayer();
    this.initializeBoardSize();
    this.cards.set(createShuffledDeck(this.symbolPool, this.boardSize()));

    this.destroyRef.onDestroy(() => {
      this.clearGameTimeouts();

      this.debugWinnerShortcut.stop();
    });
  }

  protected revealCard(card: MemoryCard): void {
    if (
      this.gameStage() !== 'playing' ||
      this.isResolvingTurn() ||
      this.showExitDialog() ||
      this.matchedCardIds().has(card.id) ||
      this.selectedCardIds().includes(card.id)
    ) {
      return;
    }

    this.revealedCardIds.update((current) => new Set(current).add(card.id));

    const nextSelected = [...this.selectedCardIds(), card.id];
    this.selectedCardIds.set(nextSelected);

    if (nextSelected.length < 2) {
      return;
    }

    const [firstCardId, secondCardId] = nextSelected;
    const deck = this.cards();
    const firstCard = deck[firstCardId];
    const secondCard = deck[secondCardId];

    if (firstCard.symbolKey === secondCard.symbolKey) {
      let matchedSizeAfterUpdate = 0;

      this.matchedCardIds.update((current) => {
        const next = new Set(current);
        next.add(firstCardId);
        next.add(secondCardId);
        matchedSizeAfterUpdate = next.size;
        return next;
      });

      this.selectedCardIds.set([]);
      this.addPointForCurrentPlayer();

      if (matchedSizeAfterUpdate === deck.length) {
        this.startGameOverSequence();
      }

      return;
    }

    this.isResolvingTurn.set(true);

    this.hideMismatchTimeoutId = window.setTimeout(() => {
      this.revealedCardIds.update((current) => {
        const next = new Set(current);
        next.delete(firstCardId);
        next.delete(secondCardId);
        return next;
      });

      this.selectedCardIds.set([]);
      this.switchPlayer();
      this.isResolvingTurn.set(false);
      this.hideMismatchTimeoutId = null;
    }, 850);
  }

  protected isCardFlipped(cardId: number): boolean {
    return this.revealedCardIds().has(cardId) || this.matchedCardIds().has(cardId);
  }

  protected isCardDisabled(cardId: number): boolean {
    return (
      this.isResolvingTurn() ||
      this.gameStage() !== 'playing' ||
      this.showExitDialog() ||
      this.matchedCardIds().has(cardId) ||
      this.selectedCardIds().includes(cardId)
    );
  }

  protected openExitDialog(): void {
    if (this.gameStage() !== 'playing') {
      return;
    }

    this.showExitDialog.set(true);
  }

  protected closeExitDialog(): void {
    this.isBackButtonHovered.set(false);
    this.isYesQuitButtonHovered.set(false);
    this.showExitDialog.set(false);
  }

  protected setExitButtonHover(isHovered: boolean): void {
    this.isExitButtonHovered.set(isHovered);
  }

  protected setBackButtonHover(isHovered: boolean): void {
    this.isBackButtonHovered.set(isHovered);
  }

  protected setYesQuitButtonHover(isHovered: boolean): void {
    this.isYesQuitButtonHovered.set(isHovered);
  }

  protected hideConfettiImage(): void {
    this.showConfettiImage.set(false);
  }

  protected replayGame(): void {
    this.clearGameTimeouts();
    this.isResolvingTurn.set(false);
    this.showExitDialog.set(false);
    this.revealedCardIds.set(new Set<number>());
    this.matchedCardIds.set(new Set<number>());
    this.selectedCardIds.set([]);
    this.blueScore.set(0);
    this.orangeScore.set(0);
    this.currentPlayer.set(this.startingPlayer());
    this.applyThemeAssets();
    this.cards.set(createShuffledDeck(this.symbolPool, this.boardSize()));
  }

  private startGameOverSequence(): void {
    if (this.gameStage() !== 'playing') {
      return;
    }

    this.showConfettiImage.set(true);
    this.gameStage.set('game-over');

    this.gameOverRevealTimeoutId = window.setTimeout(() => {
      this.winner.set(resolveWinnerByScore(this.blueScore(), this.orangeScore()));
      this.gameStage.set('winner');
      this.gameOverRevealTimeoutId = null;
    }, 1450);
  }

  private addPointForCurrentPlayer(): void {
    if (this.currentPlayer() === 'blue') {
      this.blueScore.update((score) => score + 1);
      return;
    }

    this.orangeScore.update((score) => score + 1);
  }

  private switchPlayer(): void {
    this.currentPlayer.update((player) => (player === 'blue' ? 'orange' : 'blue'));
  }

  private initializeBoardSize(): void {
    const boardSizeParam = this.route.snapshot.queryParamMap.get('boardSize');
    this.boardSize.set(parseBoardSize(boardSizeParam));
  }

  private initializeTheme(): void {
    const selectedTheme = this.route.snapshot.queryParamMap.get('theme');

    this.theme.set(isThemeId(selectedTheme) ? selectedTheme : DEFAULT_THEME_ID);
  }

  private initializeStartingPlayer(): void {
    const selectedPlayer = parseStartingPlayer(this.route.snapshot.queryParamMap.get('player'));
    this.startingPlayer.set(selectedPlayer);
    this.currentPlayer.set(selectedPlayer);
  }

  private applyThemeAssets(): void {
    this.isExitButtonHovered.set(false);
    this.isBackButtonHovered.set(false);
    this.isYesQuitButtonHovered.set(false);
    this.gameStage.set('playing');
    this.winner.set(null);
    this.showConfettiImage.set(true);

    const config = this.activeThemeConfig();
    this.symbolPool = config.symbolPool;
    this.backImage.set(config.assets.backImage);
    this.bluePlayerImage.set(config.assets.bluePlayerImage);
    this.orangePlayerImage.set(config.assets.orangePlayerImage);
    this.whitePlayerImage.set(config.assets.whitePlayerImage);
    this.exitButtonImage.set(config.assets.exitButtonImage);
    this.exitButtonHoverImage.set(config.assets.exitButtonHoverImage);
    this.backButtonImage.set(config.assets.backButtonImage);
    this.backButtonHoverImage.set(config.assets.backButtonHoverImage);
    this.yesQuitButtonImage.set(config.assets.yesQuitButtonImage);
    this.yesQuitButtonHoverImage.set(config.assets.yesQuitButtonHoverImage);
    this.confettiImage.set(config.assets.confettiImage);
    this.trophyImage.set(config.assets.trophyImage);
  }

  private forceFinishGameWithRandomWinner(): void {
    if (this.gameStage() !== 'playing') {
      return;
    }

    this.clearGameTimeouts();

    this.isResolvingTurn.set(false);
    this.selectedCardIds.set([]);
    this.showExitDialog.set(false);
    this.showConfettiImage.set(true);

    this.winner.set(pickRandomPlayerWinner());
    this.gameStage.set('winner');
  }

  private clearGameTimeouts(): void {
    if (this.hideMismatchTimeoutId !== null) {
      window.clearTimeout(this.hideMismatchTimeoutId);
      this.hideMismatchTimeoutId = null;
    }

    if (this.gameOverRevealTimeoutId !== null) {
      window.clearTimeout(this.gameOverRevealTimeoutId);
      this.gameOverRevealTimeoutId = null;
    }
  }
}
