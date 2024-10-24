import { isBrowser } from 'template/utils/platform';

class IntersectionService {
  static precision = 0.1;

  private _targets: HTMLElement[];
  private _listeners: ((entries: IntersectionObserverEntry[]) => any)[];
  private _observer: IntersectionObserver;

  get targets() {
    return this._targets;
  }

  private set targets(value: IntersectionService['_targets']) {
    this._targets = value;
  }

  get listeners() {
    return this._listeners;
  }

  private set listeners(value: IntersectionService['_listeners']) {
    this._listeners = value;
  }

  get observer() {
    return this._observer;
  }

  private set observer(value: IntersectionService['_observer']) {
    this._observer = value;
  }

  constructor() {
    if (!isBrowser()) return;
    this.initialize();

    const options = {
      threshold: Array.from(
        Array(1 / IntersectionService.precision + 1).keys(),
        index => index / (1 / IntersectionService.precision)
      ),
    };

    this.observer = new IntersectionObserver(this.onObserve, options);
  }

  disconnect() {
    this.observer.disconnect();
    this.initialize();
  }

  addTarget(target: HTMLElement) {
    this.targets.push(target);
    this.observer.observe(target);
  }

  removeTarget(target: HTMLElement) {
    const targetIndex = this.targets.indexOf(target);
    if (targetIndex !== -1) {
      this.observer.unobserve(target);
      this.targets.splice(targetIndex, 1);
    }
  }

  addListener(listener: (entries: IntersectionObserverEntry[]) => any) {
    if (!this.listeners.includes(listener)) {
      this.listeners.push(listener);
    }
  }

  removeListener(listener: (entries: IntersectionObserverEntry[]) => any) {
    const listenerIndex = this.listeners.indexOf(listener);
    if (listenerIndex !== -1) this.listeners.splice(listenerIndex, 1);
  }

  private initialize() {
    this.targets = [];
    this.listeners = [];
  }

  private readonly onObserve = (entries: IntersectionObserverEntry[]) => {
    this.listeners.forEach(listener => listener(entries));
  };
}

export default new IntersectionService();
