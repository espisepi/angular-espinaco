import {
  Component,
  signal,
  OnInit,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'sp-puzzle-game',
  templateUrl: './puzzle-game.component.html',
  styleUrls: ['./puzzle-game.component.scss'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuzzleGameComponent implements OnInit {
  readonly COLS = 5;
  readonly ROWS = 4;
  readonly CELLS = this.COLS * this.ROWS;

  imageUrl = signal<string>('assets/img.png');
  isLoading = signal<boolean>(false);
  showModal = signal<boolean>(false);
  modalMessage = signal<string>('You Won 😍');
  attempts = signal<number>(0);
  correct = signal<number>(0);

  puzzlePieces = signal<
    { id: number; bgPos: string; style: { [key: string]: string } }[]
  >([]);
  dropzones = signal<(number | null)[]>(Array(this.CELLS).fill(null));

  placedStyles = computed(() => {
    const image = this.imageUrl();
    const pieces = this.puzzlePieces();
    const styles: { [key: number]: { [key: string]: string } } = {};
    for (const piece of pieces) {
      styles[piece.id] = {
        width: '100%',
        height: '100%',
        'background-image': `url(${image})`,
        'background-position': piece.bgPos,
        'background-size': '40vw 24vw',
        'background-repeat': 'no-repeat',
      };
    }
    return styles;
  });

  ngOnInit() {
    this.loadImage(this.imageUrl());
  }

  async loadImage(url: string) {
    this.isLoading.set(true);
    const grid = this.shuffle(this.generateBackgroundPositions());

    this.puzzlePieces.set(
      grid.map((pos, i) => ({
        id: i,
        bgPos: `-${pos[1]}vw -${pos[0]}vw`,
        style: {
          position: 'absolute',
          top: `${Math.random() * 18}vw`,
          left: `${Math.random() * 32}vw`,
          width: 'calc(40vw / 5)',
          height: 'calc(24vw / 4)',
          'background-image': `url(${url})`,
          'background-position': `-${pos[1]}vw -${pos[0]}vw`,
          'background-size': '40vw 24vw',
          'background-repeat': 'no-repeat',
          cursor: 'grab',
        },
      }))
    );

    this.correct.set(0);
    this.attempts.set(0);
    this.dropzones.set(Array(this.CELLS).fill(null));
    this.isLoading.set(false);
  }

  async randomImage() {
    this.isLoading.set(true);
    const res = await fetch('https://source.unsplash.com/random/1920x1080');
    this.imageUrl.set(res.url);
    await this.loadImage(res.url);
  }

  uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const url = URL.createObjectURL(input.files[0]);
      this.imageUrl.set(url);
      this.loadImage(url);
    }
  }

  onDrop(i: number, event: DragEvent) {
    event.preventDefault();
    const draggedId = Number(event.dataTransfer?.getData('text/plain'));
    const zones = [...this.dropzones()];
    const pieces = [...this.puzzlePieces()];

    if (zones[i] === null) {
      zones[i] = draggedId;
      this.dropzones.set(zones);

      // Eliminar la pieza de la zona inicial
      const updatedPieces = pieces.filter(p => p.id !== draggedId);
      this.puzzlePieces.set(updatedPieces);

      const correct = zones.reduce<number>((acc, val, idx) => {
        return val === idx ? acc + 1 : acc;
      }, 0);
      this.correct.set(correct);

      if (correct === this.CELLS) {
        this.modalMessage.set('YOU WON 😍');
        this.showModal.set(true);
      } else if (!zones.includes(null)) {
        this.modalMessage.set('You Lost 😢. Please Try Again');
        this.showModal.set(true);
      } else if (draggedId !== i) {
        this.attempts.update(a => a + 1);
      }
    }
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  startAgain() {
    location.reload();
  }

  private shuffle<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
  }

  private generateBackgroundPositions(): [number, number][] {
    const positions: [number, number][] = [];
    for (let y = 0; y < this.ROWS; y++) {
      for (let x = 0; x < this.COLS; x++) {
        positions.push([y * 6, x * 8]);
      }
    }
    return positions;
  }
}