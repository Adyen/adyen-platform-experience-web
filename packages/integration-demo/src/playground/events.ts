import { createStore } from './createStore';

export type EventKind = 'callback' | 'playground';

export interface LoggedEvent {
    id: number;
    kind: EventKind;
    name: string;
    detail?: string;
    time: string;
}

const MAX_EVENTS = 50;
const store = createStore<readonly LoggedEvent[]>([]);
let nextId = 0;

const formatDetail = (detail: unknown) => {
    if (detail === undefined || typeof detail === 'string') return detail;
    return JSON.stringify(detail, (_key, value) => (typeof value === 'function' ? '[Function]' : value));
};

export const logEvent = (name: string, detail?: unknown, kind: EventKind = 'callback') => {
    console.info(`[integration-demo] ${name}`, detail ?? '');
    const event = { id: nextId++, kind, name, detail: formatDetail(detail), time: new Date().toLocaleTimeString() };
    store.setState([event, ...store.getState()].slice(0, MAX_EVENTS));
};

export const clearEvents = () => store.setState([]);

export const useEvents = store.useStore;
