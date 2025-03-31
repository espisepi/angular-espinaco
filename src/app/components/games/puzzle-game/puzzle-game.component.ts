import {
  Component,
  Input,
  Signal,
  signal,
  computed,
  effect,
  inject,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sp-puzzle-game',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./puzzle-game.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './puzzle-game.component.html',
})
export class PuzzleGameComponent {
  private renderer = inject(Renderer2);

  @Input() set imageUrl(url: string | undefined) {
    if (url) this.baseImage.set(url);
  }

  readonly cellsAmount = 20;
  readonly columns = 5;
  readonly rows = 4;

  readonly topPositions = Array.from({ length: this.rows }, (_, i) => i * 6);
  readonly leftPositions = Array.from(
    { length: this.columns },
    (_, i) => i * 8
  );

  baseImage = signal(
    'https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?w=800'
  );

  bgPositions = computed(() =>
    this.topPositions.flatMap((top) =>
      this.leftPositions.map((left) => ({ top, left }))
    )
  );

  shuffledPositions = signal<{ top: number; left: number }[]>([]);

  puzzleGrid = signal<{ index: number; placed?: number }[]>([]);
  pieces = signal<
    {
      index: number;
      bg: { top: number; left: number };
      pos: { top: number; left: number };
    }[]
  >([]);

  selectedPiece = signal<number | null>(null);
  correct = signal(0);
  wrong = signal(0);
  showModal = signal(false);
  won = signal(false);

  // Hover =========
  hoveredCell = signal<number | null>(null);

  onDragOver(index: number) {
    this.hoveredCell.set(index);
  }

  onDragLeave(index: number) {
    if (this.hoveredCell() === index) {
      this.hoveredCell.set(null);
    }
  }
  // FIN Hover =========

  ngOnInit() {
    this.initGame();
  }

  initGame() {
    const shuffled = this.shufflePositions();
    const bg = this.bgPositions();

    const pieces = Array.from({ length: this.cellsAmount }, (_, i) => ({
      index: i,
      bg: bg[i],
      pos: shuffled[i],
    }));

    this.pieces.set(pieces);
    this.puzzleGrid.set(
      Array.from({ length: this.cellsAmount }, (_, i) => ({ index: i }))
    );
    this.correct.set(0);
    this.wrong.set(0);
    this.showModal.set(false);
    this.won.set(false);
  }

  shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  shufflePositions() {
    return this.shuffle(this.leftPositions).flatMap((left) =>
      this.shuffle(this.topPositions).map((top) => ({ left, top }))
    );
  }

  onDragStart(i: number) {
    this.selectedPiece.set(i);
  }

  onDrop(cellIndex: number) {
    const selected = this.selectedPiece();
    if (selected == null) return;

    const grid = this.puzzleGrid();
    const targetCell = grid.find((c) => c.index === cellIndex);
    if (!targetCell || targetCell.placed != null) return;

    // Eliminar la pieza anterior (si estaba colocada)
    this.puzzleGrid.update((cells) =>
      cells.map((c) =>
        c.placed === selected ? { ...c, placed: undefined } : c
      )
    );

    // Colocar la nueva en el nuevo destino
    this.puzzleGrid.update((cells) =>
      cells.map((c) => (c.index === cellIndex ? { ...c, placed: selected } : c))
    );

    // Eliminar la pieza de las sueltas (.cells) si existía
    const remaining = this.pieces().filter((p) => p.index !== selected);
    this.pieces.set(remaining);

    // Actualizar puntos correctos
    const correctNow = this.puzzleGrid().filter(
      (c) => c.placed === c.index
    ).length;
    this.correct.set(correctNow);

    if (selected !== cellIndex) {
      this.wrong.update((v) => v + 1);
    }

    // Fin del juego
    const totalPlaced = this.puzzleGrid().filter(
      (c) => c.placed != null
    ).length;
    if (correctNow === this.cellsAmount) {
      this.won.set(true);
      this.showModal.set(true);
    } else if (totalPlaced === this.cellsAmount) {
      this.won.set(false);
      this.showModal.set(true);
    }

    // Limpiar estado
    this.selectedPiece.set(null);
    this.hoveredCell.set(null);
  }

  resetGame() {
    this.selectedPiece.set(null);
    this.hoveredCell.set(null);
    this.initGame();
  }

  trackByIndex = (i: number) => i;

  handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result as string;
        this.baseImage.set(imageUrl);
        this.resetGame();
      };
      reader.readAsDataURL(file);
    }
  }
}
