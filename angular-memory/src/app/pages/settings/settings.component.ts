import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../shared/footer/footer.component';

type ThemeId = 'code-vibes' | 'gaming' | 'da-projects' | 'foods';
type PlayerId = 'blue' | 'orange';
type BoardSizeId = 16 | 24 | 36;

interface ThemeOption {
  id: ThemeId;
  label: string;
  previewImage: string;
}

interface PlayerOption {
  id: PlayerId;
  label: string;
}

interface BoardSizeOption {
  id: BoardSizeId;
  label: string;
}

type SelectionSummary = {
  label: string;
  isPlaceholder: boolean;
};

@Component({
  selector: 'app-settings',
  imports: [RouterLink, FooterComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private readonly destroyRef = inject(DestroyRef);
  private slideshowFadeTimeoutId: number | null = null;

  protected readonly themeOptions: ThemeOption[] = [
    { id: 'code-vibes', label: 'Code vibes theme', previewImage: '/assets/settings/Frame 629.png' },
    { id: 'gaming', label: 'Gaming theme', previewImage: '/assets/settings/Property 1=gameing.png' },
    { id: 'da-projects', label: 'DA Projects theme', previewImage: '/assets/settings/Property 1=DA projects.png' },
    { id: 'foods', label: 'Foods theme', previewImage: '/assets/settings/Property 1=foods.png' },
  ];

  protected readonly playerOptions: PlayerOption[] = [
    { id: 'blue', label: 'Blue' },
    { id: 'orange', label: 'Orange' },
  ];

  protected readonly boardSizeOptions: BoardSizeOption[] = [
    { id: 16, label: '16 cards' },
    { id: 24, label: '24 cards' },
    { id: 36, label: '36 cards' },
  ];

  protected readonly selectedTheme = signal<ThemeId | null>(null);
  protected readonly selectedPlayer = signal<PlayerId | null>(null);
  protected readonly selectedBoardSize = signal<BoardSizeId | null>(null);
  protected readonly slideshowIndex = signal(0);
  protected readonly previewVisible = signal(true);

  constructor() {
    const intervalId = window.setInterval(() => {
      if (this.selectedTheme() !== null) {
        this.previewVisible.set(true);
        return;
      }

      this.previewVisible.set(false);

      if (this.slideshowFadeTimeoutId !== null) {
        window.clearTimeout(this.slideshowFadeTimeoutId);
      }

      this.slideshowFadeTimeoutId = window.setTimeout(() => {
        this.slideshowIndex.update((currentIndex) => (currentIndex + 1) % this.themeOptions.length);
        this.previewVisible.set(true);
      }, 420);
    }, 5400);

    this.destroyRef.onDestroy(() => {
      window.clearInterval(intervalId);

      if (this.slideshowFadeTimeoutId !== null) {
        window.clearTimeout(this.slideshowFadeTimeoutId);
      }
    });
  }

  protected readonly selectedThemePreview = computed(() => {
    const selected = this.themeOptions.find((option) => option.id === this.selectedTheme());
    return selected?.previewImage ?? this.themeOptions[this.slideshowIndex()].previewImage;
  });

  protected readonly selectedThemePreviewAlt = computed(() => {
    const selected = this.themeOptions.find((option) => option.id === this.selectedTheme());
    return selected?.label ?? 'Theme preview slideshow';
  });

  protected readonly themeSummary = computed<SelectionSummary>(() => {
    const selected = this.themeOptions.find((option) => option.id === this.selectedTheme());

    return {
      label: selected?.label ?? 'game theme',
      isPlaceholder: !selected,
    };
  });

  protected readonly playerSummary = computed<SelectionSummary>(() => {
    const selected = this.playerOptions.find((option) => option.id === this.selectedPlayer());

    return {
      label: selected?.label ?? 'player',
      isPlaceholder: !selected,
    };
  });

  protected readonly boardSizeSummary = computed<SelectionSummary>(() => {
    const selected = this.boardSizeOptions.find((option) => option.id === this.selectedBoardSize());

    return {
      label: selected?.label ?? 'board size',
      isPlaceholder: !selected,
    };
  });

  protected readonly canStartGame = computed(
    () => this.selectedTheme() !== null && this.selectedPlayer() !== null && this.selectedBoardSize() !== null,
  );

  protected readonly gameQueryParams = computed(() => {
    const boardSize = this.selectedBoardSize();
    const player = this.selectedPlayer();
    const theme = this.selectedTheme();

    if (boardSize === null || player === null || theme === null) {
      return null;
    }

    return { boardSize, player, theme };
  });

  protected chooseTheme(themeId: ThemeId): void {
    this.selectedTheme.set(themeId);
  }

  protected choosePlayer(playerId: PlayerId): void {
    this.selectedPlayer.set(playerId);
  }

  protected chooseBoardSize(boardSize: BoardSizeId): void {
    this.selectedBoardSize.set(boardSize);
  }
}
