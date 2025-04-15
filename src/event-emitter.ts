export default class EventEmitter<T> {
    private handlers: { [eventName in keyof T]?: ((value: T[eventName], io: string | false) => void)[] } = {};

    emit<K extends keyof T>(event: K, value: T[K], io: string | false = false): void {
        this.handlers[event]?.forEach(h => h(value, io));
    }

    on<K extends keyof T>(events: K | K[], handler: (value: T[K], io: string | false) => void): void {
        if (Array.isArray(events)) {
            events.forEach(event => this.set(event, handler));
        } else {
            this.set(events, handler);
        }
    }

    off<K extends keyof T>(events: K | K[], handler: (value: T[K], io: string | false) => void): void {
        if (Array.isArray(events)) {
            events.forEach(event => this.remove(event, handler));
        } else {
            this.remove(events, handler);
        }
    }

    private set<K extends keyof T>(event: K, handler: (value: T[K], io: string | false) => void): void {
        (this.handlers[event] ||= []).push(handler);
    }

    private remove<K extends keyof T>(event: K, handler: (value: T[K], io: string | false) => void): void {
        const handlers = this.handlers[event];
        if (!handlers) return;
        
        const index = handlers.indexOf(handler);
        if (index >= 0) handlers.splice(index, 1);
        
        if (handlers.length === 0) delete this.handlers[event];
    }
}
