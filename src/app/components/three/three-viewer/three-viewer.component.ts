import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  PLATFORM_ID,
  ViewChild,
  signal,
  effect,
  OnDestroy,
  runInInjectionContext,
  inject,
  Injector,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface ModelData {
  name: string;
  url: string;
  position: [number, number, number];
  ref?: any; // THREE.Object3D;
}

@Component({
  selector: 'sp-three-viewer',
  templateUrl: './three-viewer.component.html',
  styleUrls: ['./three-viewer.component.scss'],
  standalone: true,
})
export class ThreeViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer', { static: false }) canvasContainer!: ElementRef;
  @Input() modelUrls: string[] = [];

  private injector = inject(Injector); // Aqui si esta permitido el Injector (problemas con SSR)

  isLoading = signal(true);
  modelsLoaded = signal(0);
  totalModels = signal(0);
  loadedModels = signal<ModelData[]>([]);
  selectedModelIndex = signal<number | null>(null);
  private mixers: any; // THREE.AnimationMixer[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const THREE = await import('three');
    const { OrbitControls } = await import(
      'three/examples/jsm/controls/OrbitControls.js'
    );
    const { GLTFLoader } = await import(
      'three/examples/jsm/loaders/GLTFLoader.js'
    );

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    const camera = new THREE.PerspectiveCamera(
      75,
      this.canvasContainer.nativeElement.clientWidth /
        this.canvasContainer.nativeElement.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      this.canvasContainer.nativeElement.clientWidth,
      this.canvasContainer.nativeElement.clientHeight
    );
    this.canvasContainer.nativeElement.appendChild(renderer.domElement);

    const light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0, 1, 0);
    scene.add(light);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;

    const loader = new GLTFLoader();

    this.totalModels.set(this.modelUrls.length);
    const savedPositions = this.loadSavedPositions();

    let index = 0;
    for (const url of this.modelUrls) {
      loader.load(
        url,
        (gltf) => {
          const savedPos = savedPositions[url] || [index * 2, 0, 0];
          gltf.scene.position.set(...savedPos);
          scene.add(gltf.scene);

          if (gltf.animations?.length) {
            const mixer = new THREE.AnimationMixer(gltf.scene);
            gltf.animations.forEach((clip) => {
              mixer.clipAction(clip).play();
            });
            this.mixers.push(mixer);
          }

          this.loadedModels.update((models) => [
            ...models,
            {
              name: `Modelo ${index + 1}`,
              url,
              position: [...savedPos],
              ref: gltf.scene,
            },
          ]);

          index++;
          this.modelsLoaded.set(this.modelsLoaded() + 1);
        },
        undefined,
        (error) => {
          console.error('Error loading model:', url, error);
          this.modelsLoaded.set(this.modelsLoaded() + 1);
        }
      );
    }

    // runInInjectionContext() le dice a Angular:
    // “Ejecuta esto como si estuviera dentro de un constructor Angular”, y eso permite usar effect() sin romper SSR.
    runInInjectionContext(this.injector, () => {
      effect(() => {
        if (this.modelsLoaded() >= this.totalModels()) {
          this.isLoading.set(false);
        }
      });
    });

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (this.mixers) {
        this.mixers.forEach((m: any) => m.update(delta));
      }
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('keydown', this.handleKeyPress);
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.removeEventListener('keydown', this.handleKeyPress);
  }

  handleKeyPress = (event: KeyboardEvent) => {
    const index = this.selectedModelIndex();
    if (index === null) return;

    const models = this.loadedModels();
    const model = models[index];
    const ref = model.ref;
    if (!ref) return;

    const step = 0.2;
    switch (event.key) {
      case 'w':
        ref.position.z -= step;
        break;
      case 's':
        ref.position.z += step;
        break;
      case 'a':
        ref.position.x -= step;
        break;
      case 'd':
        ref.position.x += step;
        break;
      case 'q':
        ref.rotation.y -= 0.1;
        break;
      case 'e':
        ref.rotation.y += 0.1;
        break;
      default:
        return;
    }

    this.updateModelPositionInternal(index, [
      ref.position.x,
      ref.position.y,
      ref.position.z,
    ]);
  };

  updateModelPosition(axis: 'x' | 'y' | 'z', value: number) {
    const index = this.selectedModelIndex();
    if (index === null) return;

    const model = this.loadedModels()[index];
    const ref = model.ref;
    if (!ref) return;

    const pos = [...model.position] as [number, number, number];
    const idx = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
    pos[idx] = parseFloat(value.toString());

    ref.position.set(...pos);
    this.updateModelPositionInternal(index, pos);
  }

  resetSelectedModelPosition() {
    const index = this.selectedModelIndex();
    if (index === null) return;

    const ref = this.loadedModels()[index].ref;
    if (!ref) return;

    const defaultPos: [number, number, number] = [index * 2, 0, 0];
    ref.position.set(...defaultPos);
    this.updateModelPositionInternal(index, defaultPos);
  }

  updateModelPositionInternal(index: number, newPos: [number, number, number]) {
    const models = this.loadedModels();
    const updated = [...models];
    updated[index] = { ...models[index], position: newPos };
    this.loadedModels.set(updated);
    this.savePositionsToStorage(updated);
  }

  loadSavedPositions(): Record<string, [number, number, number]> {
    if (typeof localStorage === 'undefined') return {};
    const json = localStorage.getItem('modelPositions');
    return json ? JSON.parse(json) : {};
  }

  savePositionsToStorage(models: ModelData[]) {
    const posMap: Record<string, [number, number, number]> = {};
    for (const model of models) {
      posMap[model.url] = model.position;
    }
    localStorage.setItem('modelPositions', JSON.stringify(posMap));
  }

  // AVISO: Este getter es seguro de usar solo si ya comprobaste con @if (selectedModelIndex() !== null) antes en el HTML.
  get selectedModel(): ModelData {
    const index = this.selectedModelIndex();
    const models = this.loadedModels();
    return models[index!]!;
  }
}
