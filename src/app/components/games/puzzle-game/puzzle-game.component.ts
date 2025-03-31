import {
  Component,
  Input,
  Signal,
  signal,
  computed,
  effect,
  inject,
  Renderer2,
  ViewEncapsulation
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
  readonly leftPositions = Array.from({ length: this.columns }, (_, i) => i * 8);

  baseImage = signal('https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?w=800');

  bgPositions = computed(() =>
    this.topPositions.flatMap((top) => this.leftPositions.map((left) => ({ top, left })))
  );

  shuffledPositions = signal<{ top: number; left: number }[]>([]);

  puzzleGrid = signal<{ index: number; placed?: number }[]>([]);
  pieces = signal<{ index: number; bg: { top: number; left: number }; pos: { top: number; left: number } }[]>([]);

  selectedPiece = signal<number | null>(null);
  correct = signal(0);
  wrong = signal(0);
  showModal = signal(false);
  won = signal(false);

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
    this.puzzleGrid.set(Array.from({ length: this.cellsAmount }, (_, i) => ({ index: i })));
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
    return this.shuffle(this.leftPositions)
      .flatMap((left) =>
        this.shuffle(this.topPositions).map((top) => ({ left, top }))
      );
  }

  onDragStart(i: number) {
    this.selectedPiece.set(i);
  }

  onDrop(cellIndex: number) {
    const selected = this.selectedPiece();
    if (selected == null) return;

    const cell = this.puzzleGrid().find(c => c.index === cellIndex);
    if (!cell || cell.placed != null) return;

    const pieces = this.pieces().filter(p => p.index !== selected);
    const selectedPiece = this.pieces().find(p => p.index === selected);
    if (!selectedPiece) return;

    // Colocar pieza
    this.puzzleGrid.update(grid =>
      grid.map(c => (c.index === cellIndex ? { ...c, placed: selected } : c))
    );

    this.pieces.set(pieces);

    if (selected === cellIndex) {
      this.correct.update(v => v + 1);
    } else {
      this.wrong.update(v => v + 1);
    }

    const totalCorrect = this.correct();
    if (totalCorrect === this.cellsAmount) {
      this.won.set(true);
      this.showModal.set(true);
    } else if (!this.puzzleGrid().some(c => c.placed == null)) {
      this.won.set(false);
      this.showModal.set(true);
    }
  }

  resetGame() {
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