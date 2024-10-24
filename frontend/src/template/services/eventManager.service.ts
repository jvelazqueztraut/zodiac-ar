const IS_DEBUG = process.env.IS_DEBUG && false;

export interface Event {
  type: string;
  timestamp: number;
  data: any;
}

interface RegisteredEvent {
  listener: (event: Event) => void;
  isOnce: boolean;
}

class EventManager {
  static instanceCount = 0;

  private _events: { [eventName in Event['type']]: RegisteredEvent[] };
  private _id: string;

  get events() {
    return this._events;
  }

  private set events(value: EventManager['_events']) {
    this._events = value;
  }

  get id() {
    return this._id;
  }

  private set id(value: string) {
    this._id = value;
  }

  constructor(id?: string) {
    EventManager.instanceCount++;
    this.id = id || `${EventManager.instanceCount}`;
    this.events = {};

    if (IS_DEBUG) console.log(`EventManager ${this.id} -- Ready`);
  }

  registerEvent(eventName: Event['type']) {
    if (!this.events[eventName] && eventName.length)
      this.events[eventName] = [];
  }

  unregisterEvent(eventName: Event['type']) {
    if (this.events[eventName]) delete this.events[eventName];
  }

  on(eventName: Event['type'], listener: RegisteredEvent['listener']) {
    this.addListener(eventName, listener);
  }

  once(eventName: Event['type'], listener: RegisteredEvent['listener']) {
    this.addListener(eventName, listener, true);
  }

  off(eventName: Event['type'], listener?: RegisteredEvent['listener']) {
    this.removeListener(eventName, listener);
  }

  trigger(eventName: Event['type'], data: Event['data'] = null) {
    if (!this.events[eventName]) {
      if (IS_DEBUG)
        console.log(
          `EventManager ${this.id} -- trigger -- event`,
          eventName,
          "isn't registered, aborting"
        );
      return;
    }

    if (IS_DEBUG)
      console.log(
        `EventManager ${this.id} -- trigger -- event`,
        eventName,
        'to subscribers',
        this.events[eventName],
        data
      );

    const timestamp = Date.now();
    const listenersToRemove: RegisteredEvent['listener'][] = [];

    this.events[eventName].forEach(eventListener => {
      const event: Event = { type: eventName, timestamp, data };
      eventListener.listener(event);
      if (eventListener.isOnce) listenersToRemove.push(eventListener.listener);
    });

    if (listenersToRemove.length) {
      listenersToRemove.forEach(listener => {
        this.removeListener(eventName, listener);
      });
    }
  }

  disconnect() {
    if (IS_DEBUG) console.log(`EventManager ${this.id} -- disconnect`);
    Object.keys(this.events).forEach(eventName =>
      this.removeListener(eventName)
    );
  }

  private addListener(
    eventName: Event['type'],
    listener: RegisteredEvent['listener'],
    isOnce: RegisteredEvent['isOnce'] = false
  ) {
    if (!this.events[eventName]) {
      if (IS_DEBUG)
        console.log(
          `EventManager ${this.id} -- addListener -- event`,
          eventName,
          "isn't registered, aborting"
        );
      return;
    }

    this.events[eventName].push({
      listener,
      isOnce,
    });
  }

  private removeListener(
    eventName: Event['type'],
    listener?: RegisteredEvent['listener']
  ) {
    if (!this.events[eventName]) {
      if (IS_DEBUG)
        console.log(
          `EventManager ${this.id} -- removeListener -- event`,
          eventName,
          "isn't registered, aborting"
        );
      return;
    }

    // If no listener is specified, remove all listeners for the given event
    if (!listener) {
      this.events[eventName].splice(0, this.events[eventName].length);
      return;
    }

    const listenerIndex = this.events[eventName].findIndex(
      eventListener => eventListener.listener === listener
    );
    if (listenerIndex !== -1) this.events[eventName].splice(listenerIndex, 1);
  }
}

export default EventManager;
