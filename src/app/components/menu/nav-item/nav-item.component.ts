import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';

interface NavItem {
  label: string;
  link?: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-nav-item',
  standalone: true,
  imports: [ NavItemComponent],
  templateUrl: './nav-item.component.html',
  styleUrls: ['./nav-item.component.scss']
})
export class NavItemComponent {
  @Input({ required: true }) item!: NavItem;
  @Output() closeMenu = new EventEmitter<void>();

  expanded = signal(false);

  toggle() {
    this.expanded.update(v => !v);
  }

  onActivate(link?: string) {
    if (link) this.closeMenu.emit();
    else this.toggle();
  }
}