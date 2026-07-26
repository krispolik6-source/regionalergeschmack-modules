// js/core/eventBus.js – EventBus (v1.2)
export { EVENTS, Events } from './events.js';

class EventBus {
    constructor() {
        this.listeners = new Map();
        this.onceListeners = new Map();
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        return () => this.off(event, callback);
    }

    once(event, callback) {
        if (!this.onceListeners.has(event)) {
            this.onceListeners.set(event, []);
        }
        this.onceListeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const listeners = this.listeners.get(event);
            const index = listeners.indexOf(callback);
            if (index !== -1) listeners.splice(index, 1);
        }
        if (this.onceListeners.has(event)) {
            const listeners = this.onceListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index !== -1) listeners.splice(index, 1);
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach((callback) => {
                try {
                    callback(data);
                } catch (error) {
                    console.warn(`EventBus: błąd w listenerze dla ${event}`, error);
                }
            });
        }

        if (this.onceListeners.has(event)) {
            const callbacks = this.onceListeners.get(event);
            this.onceListeners.delete(event);
            callbacks.forEach((callback) => {
                try {
                    callback(data);
                } catch (error) {
                    console.warn(`EventBus: błąd w once listenerze dla ${event}`, error);
                }
            });
        }
    }

    removeAllListeners(event) {
        if (event) {
            this.listeners.delete(event);
            this.onceListeners.delete(event);
        } else {
            this.listeners.clear();
            this.onceListeners.clear();
        }
    }

    hasListeners(event) {
        return this.listeners.has(event) || this.onceListeners.has(event);
    }
}

export const eventBus = new EventBus();

export default eventBus;
