import { CommonModule } from '@angular/common';
import { Component, ElementRef, signal, ViewChild } from '@angular/core';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent {
  // Referencia a la grilla para calcular posiciones del cursor.
  @ViewChild('grid', { static: false }) grid!: ElementRef<HTMLDivElement>;

  // Creamos una señal para el array de imágenes (16 imágenes, asumiendo que están en la ruta "images/img-{i}.jpg")
  images = signal<string[]>(
    Array.from({ length: 16 }, (_, i) => `assets/images/img-${i + 1}.jpg`)
  );

  // Signal para la imagen seleccionada (imagen ampliada)
  selectedImage = signal<string | null>(null);

  // Signals para los estilos de la sombra (posición y opacidad)
  shadowOpacity = signal(0);
  shadowTop = signal('0px');
  shadowLeft = signal('0px');

  // Variable interna para gestionar la lógica de cierre (similar al boolVal de tu código original)
  private boolVal: boolean = false;

  // Al hacer click sobre una imagen de la grilla, se muestra la imagen grande
  onImageClick(event: MouseEvent, image: string): void {
    event.stopPropagation(); // Evitamos que el click se propague al contenedor
    this.selectedImage.set(image);
    this.boolVal = false;
  }

  // Actualiza la posición y visibilidad de la sombra en función del movimiento del ratón
  onMouseMove(event: MouseEvent): void {
    if (!this.grid) return;
    const rect = this.grid.nativeElement.getBoundingClientRect();
    const top = event.clientY - rect.top;
    const left = event.clientX - rect.left;
    this.shadowTop.set(`${top}px`);
    this.shadowLeft.set(`${left}px`);
    this.shadowOpacity.set(1);
  }

  // Cuando el ratón sale de la grilla, se oculta la sombra
  onMouseLeave(): void {
    this.shadowOpacity.set(0);
  }

  // Al hacer click en cualquier parte del wrapper se evalúa si se debe cerrar la imagen ampliada
  onWrapperClick(event: Event): void {
    const target = event.target as HTMLElement;
    // Si hay una imagen ampliada y se hace click fuera de ella...
    if (this.selectedImage() && !target.classList.contains('big-img')) {
      // La primera vez solo se activa el flag; en el siguiente click se cierra la imagen
      if (this.boolVal) {
        this.selectedImage.set(null);
        this.boolVal = false;
      } else {
        this.boolVal = true;
      }
    }
  }
}
