import { onBeforeUnmount, onMounted, ref, shallowReactive, watch } from 'vue';
import type { ExternalComponentType } from '@integration-components/types';
import { createConfigController } from '../../setupConfig';
import type { AuthSession } from '../../session/AuthSession';
import type { ConfigContextValue } from './types';

interface UseConfigControllerOptions {
    getSession: () => AuthSession;
    getType: () => ExternalComponentType | undefined;
}

export function useConfigController({ getSession, getType }: UseConfigControllerOptions) {
    let controller = createConfigController(getSession(), getType());
    let disconnect: (() => void) | undefined;

    const snapshot = controller.getSnapshot();
    const hasPermission = ref(snapshot.hasPermission);
    const configContextValue = shallowReactive<ConfigContextValue>(snapshot.contextValue);

    const updateSnapshot = () => {
        const snapshot = controller.getSnapshot();
        Object.assign(configContextValue, snapshot.contextValue);
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
