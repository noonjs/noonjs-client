type EventHandler = (...args: any[]) => void;
type EventMap = Record<string, EventHandler>;

export default class EventEmitter<Events extends EventMap = {}> {
  private events: { [E in keyof Events]?: Events[E][] } = {};

  on<Event extends keyof Events>(
    event: Event | Event[],
    listener: Events[Event]
  ): () => void {
    const events = Array.isArray(event) ? event : [event];
    events.forEach(e => (this.events[e] || (this.events[e] = [])).push(listener));
    return () => this.off(events, listener);
  }

  off<Event extends keyof Events>(
    event: Event | Event[],
    listener: Events[Event]
  ): void {
    const events = Array.isArray(event) ? event : [event];
    events.forEach(e => {
      if (!this.events[e]) return;
      this.events[e] = this.events[e]!.filter(l => l !== listener);
    });
  }

  emit<Event extends keyof Events>(
    event: Event,
    ...args: Parameters<Events[Event]>
  ): void {
    this.events[event]?.forEach(listener => listener(...args));
  }

  removeAllListeners<Event extends keyof Events>(event?: Event | Event[]): void {
    if (!event) {
      this.events = {};
    } else {
      const events = Array.isArray(event) ? event : [event];
      events.forEach(e => delete this.events[e]);
    }
  }
}