import { computed } from 'vue';
import { hasOwnProperty } from '@integration-components/utils';
import type { GlobalAppearance, WithDataGridAppearance } from '@integration-components/types';
import { useCoreContext } from './Context';

export const hasDataGridAppearance = <TAppearance extends GlobalAppearance>(
    appearance: TAppearance | undefined
): appearance is TAppearance & Required<WithDataGridAppearance> =>
    !!appearance && hasOwnProperty(appearance, 'dataGrid') && (appearance as WithDataGridAppearance).dataGrid !== undefined;

// Typed as a record over every GlobalAppearance key, so adding a global field fails to compile until it is listed here.
const GLOBAL_APPEARANCE_FIELDS: Record<keyof GlobalAppearance, true> = {
    illustrations: true,
    titles: true,
};

const GLOBAL_APPEARANCE_KEYS = Object.keys(GLOBAL_APPEARANCE_FIELDS) as (keyof GlobalAppearance)[];

const isGlobalAppearanceKey = (key: string): key is keyof GlobalAppearance => hasOwnProperty(GLOBAL_APPEARANCE_FIELDS, key);

/**
 * Global fields fall back from the component to Core. Any other key is a component-only extension (e.g. `dataGrid`)
 * and is taken from the component as-is; the component's own appearance type decides which extensions are allowed.
 * Extensions on Core's appearance are never copied, so they cannot leak into components that do not support them.
 */
export const resolveAppearance = <TComponentAppearance extends GlobalAppearance = GlobalAppearance>(
    globalAppearance: GlobalAppearance | undefined,
    componentAppearance: TComponentAppearance | undefined
): GlobalAppearance | undefined => {
    const resolved: GlobalAppearance = {};

    for (const key of GLOBAL_APPEARANCE_KEYS) {
        const value = componentAppearance?.[key] ?? globalAppearance?.[key];
        if (value !== undefined) Object.assign(resolved, { [key]: value });
    }

    for (const [key, value] of Object.entries(componentAppearance ?? {})) {
        if (!isGlobalAppearanceKey(key) && value !== undefined) Object.assign(resolved, { [key]: value });
    }

    return Object.keys(resolved).length > 0 ? resolved : undefined;
};

export const useShouldHideIllustrations = () => {
    const coreContext = useCoreContext();
    return computed(() => coreContext.appearance?.illustrations === 'hidden');
};

export const useShouldHideTitles = () => {
    const coreContext = useCoreContext();
    return computed(() => coreContext.appearance?.titles === 'hidden');
};

export const useCondensedDataGrid = () => {
    const coreContext = useCoreContext();
    return computed(() => {
        const appearance = coreContext.appearance;
        return hasDataGridAppearance(appearance) && appearance.dataGrid.density === 'condensed';
    });
};
