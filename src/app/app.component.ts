import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MenuComponent } from "./components/menu/menu.component";
import { NavigationComponent } from './components/navigation/navigation.component';
import { NavComponent } from './components/nav/nav.component';
import { ThreeViewerComponent } from './components/three/three-viewer/three-viewer.component';
import { PuzzleGameComponent } from './components/games/puzzle-game/puzzle-game.component';
import { GalleryComponent } from './components/galleries/gallery/gallery.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NavComponent, ThreeViewerComponent, PuzzleGameComponent, GalleryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

}
