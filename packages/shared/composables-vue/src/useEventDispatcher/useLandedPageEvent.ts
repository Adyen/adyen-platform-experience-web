import { onMounted, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';
import type { AdditionalEventProperties } from '@integration-components/core/EventDispatcher/eventDispatcher/user-events';
import { useEventDispatcherContext } from '@integration-components/core/vue';

export const useLandedPageEvent = (eventProperties: MaybeRefOrGetter<AdditionalEventProperties>, enabled: MaybeRefOrGetter<boolean> = true) => {
    const userEvents = useEventDispatcherContext();
    const hasLanded = ref(false);

    onMounted(() => {
        watch(
            () => toValue(enabled),
            isEnabled => {
                if (!isEnabled || hasLanded.value) return;

                hasLanded.value = true;
                userEvents.addEvent?.('Landed on page', toValue(eventProperties));
            },
            { immediate: true }
        );
    });
};
