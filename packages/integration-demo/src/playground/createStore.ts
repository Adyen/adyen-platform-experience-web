import { useSyncExternalStore } from 'react';

export const createStore = <T>(initialState: T) => {
    let state = initialState;
    const listeners = new Set<() => void>();

    const subscribe = (listener: () => void) => {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    };

    const getState = () => state;

    const setState = (next: T) => {
        state = next;
        listeners.forEach(listener => listener());
    };

    const useStore = () => useSyncExternalStore(subscribe, getState);

    return { getState, setState, useStore };
};
