export type ThemeId = 'code-vibes' | 'gaming' | 'da-projects' | 'foods';
export type PlayerId = 'blue' | 'orange';
export type WinnerId = PlayerId | 'draw';

export interface SymbolDefinition {
  key: string;
  frontImage: string;
  frontFilter: string | null;
}

export interface ThemeAssetConfig {
  backImage: string;
  bluePlayerImage: string;
  orangePlayerImage: string;
  whitePlayerImage: string;
  exitButtonImage: string;
  exitButtonHoverImage: string | null;
  backButtonImage: string;
  backButtonHoverImage: string | null;
  yesQuitButtonImage: string | null;
  yesQuitButtonHoverImage: string | null;
  confettiImage: string;
  trophyImage: string;
}

export interface ThemeResultConfig {
  winnerTitles: Record<WinnerId, string>;
  winnerSymbols: Record<WinnerId, string | null>;
  winnerSymbolClass: string;
  winnerBackButtonLabel: string;
  gameOverBlueScoreImage: string | null;
  gameOverOrangeScoreImage: string | null;
  gameOverLabelImage: string | null;
  showConfetti: boolean;
}

export interface ThemeHeaderConfig {
  currentPlayerBadgeClass: Record<PlayerId, string>;
}

export interface GameThemeConfig {
  id: ThemeId;
  symbolPool: SymbolDefinition[];
  assets: ThemeAssetConfig;
  usesWhiteCurrentPlayerSymbol: boolean;
  header: ThemeHeaderConfig;
  result: ThemeResultConfig;
}
