import { Component, signal } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { NavItemComponent } from './nav-item/nav-item.component';

interface NavItem {
  label: string;
  link?: string;
  children?: NavItem[];
}

@Component({
  selector: 'sp-menu',
  standalone: true,
  imports: [NavItemComponent],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
  isOpen = signal(false);

  menuItems: NavItem[] = [
    { label: 'Inicio', link: '/' },
    {
      label: 'Servicios',
      children: [
        { label: 'Diseño Web', link: '/servicios/diseno' },
        { label: 'Desarrollo', link: '/servicios/desarrollo' }
      ]
    },
    {
      label: 'Proyectos',
      children: [
        {
          label: '2024',
          children: [
            { label: 'Proyecto A', link: '/proyectos/2024/a' },
            { label: 'Proyecto B', link: '/proyectos/2024/b' }
          ]
        }
      ]
    },
    { label: 'Contacto', link: '/contacto' }
  ];

  toggleMenu() {
    this.isOpen.update(value => !value);
  }

  closeMenu() {
    this.isOpen.set(false);
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') this.closeMenu();
  }
}