const IS_DEBUG = process.env.IS_DEBUG && false;

class TickerService {
  private _fps: number;
  private _tick: number;
  private _lastCallTime: number;
  private _listeners: ((...args: any[]) => any)[];
  private _isActive: boolean;
  private raf: number;
  private fpsArray: number[];

  get fps() {
    return this._fps;
  }

  private set fps(value: number) {
    this._fps = value;
  }

  get tick() {
    return this._tick;
  }

  private set tick(value: number) {
    this._tick = value;
  }

  get lastCallTime() {
    return this._lastCallTime;
  }

  private set lastCallTime(value: number) {
    this._lastCallTime = value;
  }

  get listeners() {
    return this._listeners;
  }

  private set listeners(value: TickerService['_listeners']) {
    this._listeners = value;
  }

  get isActive() {
    return this._isActive;
  }

  private set isActive(value: boolean) {
    this._isActive = value;
  }

  constructor() {
    this.raf = null;
    this.isActive = false;
    this.initialize();
  }

  dispose() {
    if (IS_DEBUG) console.log('TickerService -- dispose');
    this.stop();
    this.initialize();
  }

  start() {
    if (this.isActive) {
      if (IS_DEBUG)
        console.log('TickerService -- start -- Has already started');
      return;
    }

    if (IS_DEBUG) console.log('TickerService -- start');
    this.lastCallTime = window.performance.now();
    this.fps = 0;
    this.tick = 0;
    this.raf = window.requestAnimationFrame(this.onTick);

    this.isActive = true;
  }

  stop() {
    if (IS_DEBUG) console.log('TickerService -- stop');
    window.cancelAnimationFrame(this.raf);
    this.raf = null;
    this.isActive = false;
  }

  addListener(handler: (...args: any[]) => any): void {
    if (!this.listeners.includes(handler)) {
      this.listeners.push(handler);
    }
  }

  removeListener(handler: (...args: any[]) => any): void {
    this.listeners.filter(h => h !== handler);
  }

  private initialize() {
    this.listeners = [];
    this.fpsArray = [];
  }

  private readonly onTick = () => {
    const now = window.performance.now();
    const delta = (now - this.lastCallTime) * 0.001;
    this.lastCallTime = now;
    this.tick++;

    // Adapted from https://gist.github.com/WA9ACE/d51659371a345a9327bd
    this.fps = Math.ceil(1 / delta);

    if (this.tick >= 60) {
      const sum = this.fpsArray.reduce((a, b) => a + b);
      const average = Math.ceil(sum / this.fpsArray.length);
      this.fps = average;
    } else {
      if (this.fps !== Infinity) {
        this.fpsArray.push(this.fps);
      }
    }

    this.listeners.forEach(handler => {
      handler(delta, this.fps, this.lastCallTime);
    });
    this.raf = window.requestAnimationFrame(this.onTick);
  };
}

export default new TickerService();
