import { onBeforeUnmount, onMounted, ref, shallowReactive, watch } from 'vue';
import type { ExternalComponentType } from '@integration-components/types';
import type { ConfigControllerSnapshot } from '../../setupConfig';
import { createConfigController } from '../../setupConfig';
import type { AuthSession } from '../../session/AuthSession';
import type { ConfigContextValue } from './types';

interface UseConfigControllerOptions {
    getSession: () => AuthSession;
    getType: () => ExternalComponentType | undefined;
}

const updateConfigContextValueFromSnapshot = (configContextValue: Partial<ConfigContextValue>, snapshot: ConfigControllerSnapshot) => {
    return Object.assign(configContextValue, snapshot.contextValue, {
        componentUnavailable: snapshot.hasPermission === false,
        permissionPending: snapshot.hasPermission === undefined,
    });
};

export function useConfigController({ getSession, getType }: UseConfigControllerOptions) {
    let controller = createConfigController(getSession(), getType());
    let disconnect: (() => void) | undefined;

    const snapshot = controller.getSnapshot();
    const hasPermission = ref(snapshot.hasPermission);
    const configContextValue = shallowReactive<ConfigContextValue>(updateConfigContextValueFromSnapshot({}, snapshot));

    const updateSnapshot = () => {
        const snapshot = controller.getSnapshot();
        updateConfigContextValueFromSnapshot(configContextValue, snapshot);
        hasPermission.value = snapshot.hasPermission;
    };

    const replaceController = () => {
        disconnect?.();
        controller = createConfigController(getSession(), getType());
        updateSnapshot();
        disconnect = controller.connect(updateSnapshot);
    };

    onMounted(replaceController);
    watch([getSession, getType], replaceController);
    onBeforeUnmount(() => disconnect?.());

    return { configContextValue, hasPermission };
}
