import { onMounted, onUnmounted } from 'vue';
import type { AdditionalEventProperties } from '@integration-components/core/EventDispatcher/eventDispatcher/user-events';
import { useEventDispatcherContext } from '@integration-components/core/vue';

export const useDurationEvent = (eventProperties: AdditionalEventProperties) => {
    const userEvents = useEventDispatcherContext();
    let startTime: number | undefined;

    onMounted(() => {
        startTime = performance.now();
    });

    onUnmounted(() => {
        if (startTime !== undefined) {
            userEvents.addEvent?.('Duration', { ...eventProperties, duration: Math.floor(performance.now() - startTime) });
        }
    });
};
