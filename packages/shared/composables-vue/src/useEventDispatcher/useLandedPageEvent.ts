import { onMounted, toValue, watch } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import type { AdditionalEventProperties } from '@integration-components/core/EventDispatcher/eventDispatcher/user-events';
import { useEventDispatcherContext } from '@integration-components/core/vue';

export const useLandedPageEvent = (eventProperties: AdditionalEventProperties, enabled: MaybeRefOrGetter<boolean> = true) => {
    const userEvents = useEventDispatcherContext();
    let eventSent = false;

    onMounted(() => {
        watch(
            () => toValue(enabled),
            isEnabled => {
                if (isEnabled && !eventSent) {
                    eventSent = true;
                    userEvents.addEvent?.('Landed on page', eventProperties);
                }
            },
            { immediate: true }
        );
    });
};
