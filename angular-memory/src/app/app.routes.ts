import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { GameComponent } from './pages/game/game.component';

export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'settings', component: SettingsComponent },
	{ path: 'game', component: GameComponent },
	{ path: '**', redirectTo: '' },
];
