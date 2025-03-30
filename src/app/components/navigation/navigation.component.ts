import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sp-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  isOpen = signal(false);

  toggleNav() {
    this.isOpen.update(value => !value);
  }

  closeNav() {
    this.isOpen.set(false);
  }
}