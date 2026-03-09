import { Component, computed, signal } from '@angular/core';

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

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
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

  protected readonly selectedTheme = signal<ThemeId>('code-vibes');
  protected readonly selectedPlayer = signal<PlayerId>('blue');
  protected readonly selectedBoardSize = signal<BoardSizeId>(16);

  protected readonly selectedThemePreview = computed(() => {
    const selected = this.themeOptions.find((option) => option.id === this.selectedTheme());
    return selected?.previewImage ?? this.themeOptions[0].previewImage;
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
