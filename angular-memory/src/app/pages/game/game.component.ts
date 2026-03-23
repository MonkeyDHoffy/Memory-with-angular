import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface MemoryCard {
  id: number;
  symbolKey: string;
  frontImage: string;
  frontFilter: string | null;
}

type PlayerId = 'blue' | 'orange';
type BoardSizeId = 16 | 24 | 36;
type ThemeId = 'code-vibes' | 'gaming' | 'da-projects' | 'foods';

interface SymbolDefinition {
  key: string;
  frontImage: string;
  frontFilter: string | null;
}

@Component({
  selector: 'app-game',
  imports: [RouterLink],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private hideMismatchTimeoutId: number | null = null;
  private symbolPool: SymbolDefinition[] = [];

  private readonly codeVibeSymbolPool: SymbolDefinition[] = [
    { key: 'symbol-01', frontImage: '/assets/gamethemes/codevibe/cards/Property 1=Component 22.png', frontFilter: null },
    { key: 'symbol-02', frontImage: '/assets/gamethemes/codevibe/cards/Property 1=Component 22 (1).png', frontFilter: null },
    { key: 'symbol-03', frontImage: '/assets/gamethemes/codevibe/cards/Property 1=Component 22 (2).png', frontFilter: null },
    { key: 'symbol-04', frontImage: '/assets/gamethemes/codevibe/cards/Property 1=Component 22 (3).png', frontFilter: null },
    { key: 'symbol-05', frontImage: '/assets/gamethemes/codevibe/cards/Property 1=Component 22 (4).png', frontFilter: null },
    { key: 'symbol-06', frontImage: '/assets/gamethemes/codevibe/cards/Property 1=Component 22 (5).png', frontFilter: null },
    { key: 'symbol-07', frontImage: '/assets/gamethemes/codevibe/cards/Property 1=Component 22 (6).png', frontFilter: null },
    { key: 'symbol-08', frontImage: '/assets/gamethemes/codevibe/cards/Property 1=Component 22 (7).png', frontFilter: null },
    { key: 'symbol-09', frontImage: '/assets/gamethemes/codevibe/cards/Property 1=Component 22 (8).png', frontFilter: null },
    { key: 'symbol-10', frontImage: '/assets/gamethemes/codevibe/cards/Property 1=Component 22 (9).png', frontFilter: null },
    { key: 'symbol-11', frontImage: '/assets/gamethemes/codevibe/cards/Property 1=Component 22 (10).png', frontFilter: null },
    { key: 'symbol-12', frontImage: '/assets/gamethemes/codevibe/cards/Property 1=Component 22 (11).png', frontFilter: null },
    { key: 'symbol-13', frontImage: '/assets/gamethemes/codevibe/cards/Property 1=Component 22 (12).png', frontFilter: null },
    { key: 'symbol-14', frontImage: '/assets/gamethemes/codevibe/cards/Property 1=Component 22 (13).png', frontFilter: null },
    { key: 'symbol-15', frontImage: '/assets/gamethemes/codevibe/cards/Property 1=Component 22 (14).png', frontFilter: null },
    { key: 'symbol-16', frontImage: '/assets/gamethemes/codevibe/cards/Front.png', frontFilter: null },
    { key: 'symbol-17', frontImage: '/assets/gamethemes/codevibe/cards/Property 1=Component 22 (1).png', frontFilter: 'hue-rotate(115deg) saturate(1.2)' },
    { key: 'symbol-18', frontImage: '/assets/gamethemes/codevibe/cards/Property 1=Component 22 (2).png', frontFilter: 'hue-rotate(245deg) saturate(1.15)' },
  ];

  private readonly gamesThemeSymbolPool: SymbolDefinition[] = [
    { key: 'symbol-01', frontImage: '/assets/gamethemes/gamestheme/Property 1=Component 2 (1).png', frontFilter: null },
    { key: 'symbol-02', frontImage: '/assets/gamethemes/gamestheme/Property 1=Component 2 (2).png', frontFilter: null },
    { key: 'symbol-03', frontImage: '/assets/gamethemes/gamestheme/Property 1=Component 2 (3).png', frontFilter: null },
    { key: 'symbol-04', frontImage: '/assets/gamethemes/gamestheme/Property 1=Component 2 (4).png', frontFilter: null },
    { key: 'symbol-05', frontImage: '/assets/gamethemes/gamestheme/Property 1=Component 2 (5).png', frontFilter: null },
    { key: 'symbol-06', frontImage: '/assets/gamethemes/gamestheme/Property 1=Component 2 (6).png', frontFilter: null },
    { key: 'symbol-07', frontImage: '/assets/gamethemes/gamestheme/Property 1=Component 2 (8).png', frontFilter: null },
    { key: 'symbol-08', frontImage: '/assets/gamethemes/gamestheme/Property 1=Component 2 (9).png', frontFilter: null },
    { key: 'symbol-09', frontImage: '/assets/gamethemes/gamestheme/Property 1=Component 2 (10).png', frontFilter: null },
    { key: 'symbol-10', frontImage: '/assets/gamethemes/gamestheme/Property 1=Component 2 (11).png', frontFilter: null },
    { key: 'symbol-11', frontImage: '/assets/gamethemes/gamestheme/Property 1=Component 2 (12).png', frontFilter: null },
    { key: 'symbol-12', frontImage: '/assets/gamethemes/gamestheme/Property 1=Component 2 (13).png', frontFilter: null },
    { key: 'symbol-13', frontImage: '/assets/gamethemes/gamestheme/Property 1=Component 2 (14).png', frontFilter: null },
    { key: 'symbol-14', frontImage: '/assets/gamethemes/gamestheme/Property 1=Component 2 (15).png', frontFilter: null },
    { key: 'symbol-15', frontImage: '/assets/gamethemes/gamestheme/Property 1=Component 2 (16).png', frontFilter: null },
    { key: 'symbol-16', frontImage: '/assets/gamethemes/gamestheme/Front.png', frontFilter: null },
    { key: 'symbol-17', frontImage: '/assets/gamethemes/gamestheme/circle.png', frontFilter: null },
    { key: 'symbol-18', frontImage: '/assets/gamethemes/gamestheme/Property 1=Component 2 (1).png', frontFilter: 'hue-rotate(145deg) saturate(1.15)' },
  ];

  private readonly daProjectsSymbolPool: SymbolDefinition[] = [
    { key: 'symbol-01', frontImage: '/assets/gamethemes/daprojects/Property 1=Component 2.png', frontFilter: null },
    { key: 'symbol-02', frontImage: '/assets/gamethemes/daprojects/Property 1=Component 2 (1).png', frontFilter: null },
    { key: 'symbol-03', frontImage: '/assets/gamethemes/daprojects/Property 1=Component 2 (2).png', frontFilter: null },
    { key: 'symbol-04', frontImage: '/assets/gamethemes/daprojects/Property 1=Component 2 (3).png', frontFilter: null },
    { key: 'symbol-05', frontImage: '/assets/gamethemes/daprojects/Property 1=Component 2 (4).png', frontFilter: null },
    { key: 'symbol-06', frontImage: '/assets/gamethemes/daprojects/Property 1=Component 2 (5).png', frontFilter: null },
    { key: 'symbol-07', frontImage: '/assets/gamethemes/daprojects/Property 1=Component 2 (6).png', frontFilter: null },
    { key: 'symbol-08', frontImage: '/assets/gamethemes/daprojects/Property 1=Component 2 (7).png', frontFilter: null },
    { key: 'symbol-09', frontImage: '/assets/gamethemes/daprojects/Property 1=Component 2 (8).png', frontFilter: null },
    { key: 'symbol-10', frontImage: '/assets/gamethemes/daprojects/Property 1=Component 2 (9).png', frontFilter: null },
    { key: 'symbol-11', frontImage: '/assets/gamethemes/daprojects/Property 1=Component 2 (10).png', frontFilter: null },
    { key: 'symbol-12', frontImage: '/assets/gamethemes/daprojects/Property 1=Component 2 (11).png', frontFilter: null },
    { key: 'symbol-13', frontImage: '/assets/gamethemes/daprojects/Property 1=Component 2 (12).png', frontFilter: null },
    { key: 'symbol-14', frontImage: '/assets/gamethemes/daprojects/Property 1=Component 2 (13).png', frontFilter: null },
    { key: 'symbol-15', frontImage: '/assets/gamethemes/daprojects/Property 1=Component 2 (14).png', frontFilter: null },
    { key: 'symbol-16', frontImage: '/assets/gamethemes/daprojects/Property 1=Component 2 (15).png', frontFilter: null },
    { key: 'symbol-17', frontImage: '/assets/gamethemes/daprojects/Property 1=Component 2 (16).png', frontFilter: null },
    { key: 'symbol-18', frontImage: '/assets/gamethemes/daprojects/Property 1=Component 2 (1).png', frontFilter: 'hue-rotate(140deg) saturate(1.2)' },
  ];

  private readonly foodsSymbolPool: SymbolDefinition[] = [
    { key: 'symbol-01', frontImage: '/assets/gamethemes/food/Property 1=Component 3.png', frontFilter: null },
    { key: 'symbol-02', frontImage: '/assets/gamethemes/food/Property 1=Component 3 (1).png', frontFilter: null },
    { key: 'symbol-03', frontImage: '/assets/gamethemes/food/Property 1=Component 3 (2).png', frontFilter: null },
    { key: 'symbol-04', frontImage: '/assets/gamethemes/food/Property 1=Component 3 (3).png', frontFilter: null },
    { key: 'symbol-05', frontImage: '/assets/gamethemes/food/Property 1=Component 3 (4).png', frontFilter: null },
    { key: 'symbol-06', frontImage: '/assets/gamethemes/food/Property 1=Component 3 (5).png', frontFilter: null },
    { key: 'symbol-07', frontImage: '/assets/gamethemes/food/Property 1=Component 3 (6).png', frontFilter: null },
    { key: 'symbol-08', frontImage: '/assets/gamethemes/food/Property 1=Component 3 (7).png', frontFilter: null },
    { key: 'symbol-09', frontImage: '/assets/gamethemes/food/Property 1=Component 3 (8).png', frontFilter: null },
    { key: 'symbol-10', frontImage: '/assets/gamethemes/food/Property 1=Component 3 (9).png', frontFilter: null },
    { key: 'symbol-11', frontImage: '/assets/gamethemes/food/Property 1=Component 3 (10).png', frontFilter: null },
    { key: 'symbol-12', frontImage: '/assets/gamethemes/food/Property 1=Component 3 (11).png', frontFilter: null },
    { key: 'symbol-13', frontImage: '/assets/gamethemes/food/Property 1=Component 3 (12).png', frontFilter: null },
    { key: 'symbol-14', frontImage: '/assets/gamethemes/food/Property 1=Component 3 (13).png', frontFilter: null },
    { key: 'symbol-15', frontImage: '/assets/gamethemes/food/Property 1=Component 3 (14).png', frontFilter: null },
    { key: 'symbol-16', frontImage: '/assets/gamethemes/food/Property 1=Component 3 (15).png', frontFilter: null },
    { key: 'symbol-17', frontImage: '/assets/gamethemes/food/Property 1=Component 3 (16).png', frontFilter: null },
    { key: 'symbol-18', frontImage: '/assets/gamethemes/food/Property 1=Component 3 (2).png', frontFilter: 'hue-rotate(28deg) saturate(1.2)' },
  ];

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
  protected readonly showExitDialog = signal(false);
  protected readonly revealedCardIds = signal<Set<number>>(new Set<number>());
  protected readonly matchedCardIds = signal<Set<number>>(new Set<number>());
  protected readonly selectedCardIds = signal<number[]>([]);
  protected readonly isResolvingTurn = signal(false);
  protected readonly currentPlayer = signal<PlayerId>('blue');
  protected readonly blueScore = signal(0);
  protected readonly orangeScore = signal(0);

  protected readonly currentPlayerSymbol = computed(() => {
    if (this.theme() === 'gaming') return this.whitePlayerImage();
    return this.currentPlayer() === 'blue' ? this.bluePlayerImage() : this.orangePlayerImage();
  });

  protected readonly currentPlayerBadgeClass = computed(() => {
    if (this.theme() === 'gaming') {
      return this.currentPlayer() === 'blue'
        ? 'player-indicator-badge player-indicator-badge--blue'
        : 'player-indicator-badge player-indicator-badge--orange';
    }
    return 'player-indicator-badge';
  });

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

  constructor() {
    this.initializeTheme();
    this.applyThemeAssets();
    this.initializeStartingPlayer();
    this.initializeBoardSize();
    this.cards.set(this.createShuffledDeck(this.boardSize()));

    this.destroyRef.onDestroy(() => {
      if (this.hideMismatchTimeoutId !== null) {
        window.clearTimeout(this.hideMismatchTimeoutId);
      }
    });
  }

  protected revealCard(card: MemoryCard): void {
    if (
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
      this.matchedCardIds.update((current) => {
        const next = new Set(current);
        next.add(firstCardId);
        next.add(secondCardId);
        return next;
      });

      this.selectedCardIds.set([]);
      this.addPointForCurrentPlayer();
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
      this.showExitDialog() ||
      this.matchedCardIds().has(cardId) ||
      this.selectedCardIds().includes(cardId)
    );
  }

  protected openExitDialog(): void {
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
    const queryValue = this.route.snapshot.queryParamMap.get('boardSize');
    const parsedBoardSize = Number(queryValue);

    if (parsedBoardSize === 24 || parsedBoardSize === 36) {
      this.boardSize.set(parsedBoardSize);
      return;
    }

    this.boardSize.set(16);
  }

  private initializeTheme(): void {
    const selectedTheme = this.route.snapshot.queryParamMap.get('theme');

    if (selectedTheme === 'gaming') {
      this.theme.set('gaming');
      return;
    }

    if (selectedTheme === 'da-projects') {
      this.theme.set('da-projects');
      return;
    }

    if (selectedTheme === 'foods') {
      this.theme.set('foods');
      return;
    }

    this.theme.set('code-vibes');
  }

  private initializeStartingPlayer(): void {
    const selectedPlayer = this.route.snapshot.queryParamMap.get('player');

    if (selectedPlayer === 'orange') {
      this.currentPlayer.set('orange');
      return;
    }

    this.currentPlayer.set('blue');
  }

  private createShuffledDeck(boardSize: BoardSizeId): MemoryCard[] {
    const pairCount = boardSize / 2;
    const selectedSymbols = this.symbolPool.slice(0, pairCount);

    const pairedDeck = selectedSymbols.flatMap((symbol) => [
      {
        symbolKey: symbol.key,
        frontImage: symbol.frontImage,
        frontFilter: symbol.frontFilter,
      },
      {
        symbolKey: symbol.key,
        frontImage: symbol.frontImage,
        frontFilter: symbol.frontFilter,
      },
    ]);

    const shuffled = this.shuffleCards(pairedDeck);

    return shuffled.map((card, id) => ({
      id,
      symbolKey: card.symbolKey,
      frontImage: card.frontImage,
      frontFilter: card.frontFilter,
    }));
  }

  private shuffleCards(cards: Array<{ symbolKey: string; frontImage: string; frontFilter: string | null }>): Array<{ symbolKey: string; frontImage: string; frontFilter: string | null }> {
    const shuffled = [...cards];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      const currentCard = shuffled[index];
      shuffled[index] = shuffled[randomIndex];
      shuffled[randomIndex] = currentCard;
    }

    return shuffled;
  }

  private applyThemeAssets(): void {
    this.isExitButtonHovered.set(false);
    this.isBackButtonHovered.set(false);
    this.isYesQuitButtonHovered.set(false);

    if (this.theme() === 'gaming') {
      this.symbolPool = this.gamesThemeSymbolPool;
      this.backImage.set('/assets/gamethemes/gamestheme/hiddengame.png');
      this.bluePlayerImage.set('/assets/gamethemes/gamestheme/blue.png');
      this.orangePlayerImage.set('/assets/gamethemes/gamestheme/orange.png');
      this.whitePlayerImage.set('/assets/gamethemes/gamestheme/white.png');
      this.exitButtonImage.set('/assets/gamethemes/gamestheme/exit.png');
      this.exitButtonHoverImage.set(null);
      this.backButtonImage.set('/assets/gamethemes/gamestheme/back.png');
      this.backButtonHoverImage.set('/assets/gamethemes/gamestheme/backhover.png');
      this.yesQuitButtonImage.set('/assets/gamethemes/gamestheme/yesquitthegame.png');
      this.yesQuitButtonHoverImage.set(null);
      return;
    }

    if (this.theme() === 'da-projects') {
      this.symbolPool = this.daProjectsSymbolPool;
      this.backImage.set('/assets/gamethemes/daprojects/Frame 727.png');
      this.bluePlayerImage.set('/assets/gamethemes/gamestheme/blue.png');
      this.orangePlayerImage.set('/assets/gamethemes/gamestheme/orange.png');
      this.exitButtonImage.set('/assets/gamethemes/daprojects/exit.png');
      this.exitButtonHoverImage.set('/assets/gamethemes/daprojects/exithover.png');
      this.backButtonImage.set('/assets/gamethemes/daprojects/back.png');
      this.backButtonHoverImage.set('/assets/gamethemes/daprojects/backhover.png');
      this.yesQuitButtonImage.set('/assets/gamethemes/daprojects/bye.png');
      this.yesQuitButtonHoverImage.set('/assets/gamethemes/daprojects/byehover.png');
      return;
    }

    if (this.theme() === 'foods') {
      this.symbolPool = this.foodsSymbolPool;
      this.backImage.set('/assets/gamethemes/food/hidden.png');
      this.bluePlayerImage.set('/assets/gamethemes/gamestheme/blue.png');
      this.orangePlayerImage.set('/assets/gamethemes/gamestheme/orange.png');
      this.exitButtonImage.set('/assets/gamethemes/food/exit.png');
      this.exitButtonHoverImage.set('/assets/gamethemes/food/exithover.png');
      this.backButtonImage.set('/assets/gamethemes/food/back.png');
      this.backButtonHoverImage.set('/assets/gamethemes/food/backhover.png');
      this.yesQuitButtonImage.set(null);
      this.yesQuitButtonHoverImage.set(null);
      return;
    }

    this.symbolPool = this.codeVibeSymbolPool;
    this.backImage.set('/assets/gamethemes/codevibe/cards/hidden.png');
    this.bluePlayerImage.set('/assets/gamethemes/codevibe/blue.png');
    this.orangePlayerImage.set('/assets/gamethemes/codevibe/orange.png');
    this.whitePlayerImage.set('/assets/gamethemes/gamestheme/white.png');
    this.exitButtonImage.set('/assets/gamethemes/codevibe/exit.png');
    this.exitButtonHoverImage.set(null);
    this.backButtonImage.set('/assets/gamethemes/codevibe/back.png');
    this.backButtonHoverImage.set(null);
    this.yesQuitButtonImage.set(null);
    this.yesQuitButtonHoverImage.set(null);
  }
}
