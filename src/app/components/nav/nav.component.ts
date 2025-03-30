import { Component, signal } from '@angular/core';

@Component({
  selector: 'sp-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  standalone: true,
})
export class NavComponent {
  readonly navText = ['About', 'Clients', 'Portfolio', 'Careers', 'Fun'];
  active = signal(false);
  navImgPosition = signal({ x: 0, rotate: 0 });

  toggleMenu = () => {
    this.active.update((a) => !a);
  };

  moveImage(position: number) {
    this.navImgPosition.set({ x: position, rotate: position * 8 });
  }

  getTransform() {
    const { x, rotate } = this.navImgPosition();
    return `translate(${x}%, -50%) rotate(${rotate}deg)`;
  }
}