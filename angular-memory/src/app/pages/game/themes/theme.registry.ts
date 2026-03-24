import { GameThemeConfig, ThemeId } from './theme.model';
import { CODE_VIBES_THEME } from './themes.code-vibes';
import { DA_PROJECTS_THEME } from './themes.da-projects';
import { FOODS_THEME } from './themes.foods';
import { GAMING_THEME } from './themes.gaming';

export const DEFAULT_THEME_ID: ThemeId = 'code-vibes';

export const THEME_CONFIGS: Record<ThemeId, GameThemeConfig> = {
  'code-vibes': CODE_VIBES_THEME,
  gaming: GAMING_THEME,
  'da-projects': DA_PROJECTS_THEME,
  foods: FOODS_THEME,
};

export function isThemeId(value: string | null): value is ThemeId {
  if (value === null) {
    return false;
  }

  return value === 'code-vibes' || value === 'gaming' || value === 'da-projects' || value === 'foods';
}
