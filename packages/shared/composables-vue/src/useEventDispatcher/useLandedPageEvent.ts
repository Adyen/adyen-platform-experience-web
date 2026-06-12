import { onMounted } from 'vue';
import type { AdditionalEventProperties } from '@integration-components/core/EventDispatcher/eventDispatcher/user-events';
import { useEventDispatcherContext } from '@integration-components/core/vue';

export const useLandedPageEvent = (eventProperties: AdditionalEventProperties) => {
    const userEvents = useEventDispatcherContext();

    onMounted(() => {
        userEvents.addEvent?.('Landed on page', eventProperties);
    });
};
