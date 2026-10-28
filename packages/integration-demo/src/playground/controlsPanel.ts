import { createStore } from './createStore';

export const CONTROLS_PANEL_ID = 'playground-controls';

const WIDE_VIEWPORT_QUERY = '(min-width: 1101px)';

const storage = (() => {
    try {
        return window.localStorage;
    } catch {
        return undefined;
    }
})();

const isWideViewport = () => window.matchMedia(WIDE_VIEWPORT_QUERY).matches;
const getStorageKey = () => `integration-demo:controls-panel-open:${isWideViewport() ? 'wide' : 'narrow'}`;

const getInitialOpen = () => {
    const stored = storage?.getItem(getStorageKey());
    return stored == null ? isWideViewport() : stored === 'true';
};

const store = createStore({ available: false, open: getInitialOpen() });

const patchState = (patch: Partial<ReturnType<typeof store.getState>>) => store.setState({ ...store.getState(), ...patch });

export const setControlsPanelAvailable = (available: boolean) => patchState({ available });

export const setControlsPanelOpen = (open: boolean) => {
    patchState({ open });
    storage?.setItem(getStorageKey(), String(open));
};

export const toggleControlsPanel = () => setControlsPanelOpen(!store.getState().open);

export const useControlsPanel = store.useStore;
