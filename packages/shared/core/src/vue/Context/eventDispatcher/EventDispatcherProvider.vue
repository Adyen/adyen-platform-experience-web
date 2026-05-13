<script setup lang="ts">
import { provide, computed, watchEffect } from 'vue';
import { setupAnalytics } from '../../../setupAnalytics';
import type { ExternalComponentType } from '@integration-components/types';
import type { EventQueueItem } from '../../../EventDispatcher/eventDispatcher/user-events';
import { usePushAnalyticEvent } from '../../useEventDispatcher/usePushAnalyticEvent';
import { EVENT_DISPATCHER_CONTEXT_KEY } from './constants';

interface Props {
    componentName?: string;
    analyticsEnabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    analyticsEnabled: false,
});

const pushAnalyticEvent = usePushAnalyticEvent();

const pushEvent = (data: EventQueueItem) => {
    const { name, properties } = data;
    pushAnalyticEvent({
        event: name,
        properties: properties || {},
    });
};

const analytics = computed(() =>
    setupAnalytics({
        analyticsEnabled: props.analyticsEnabled ?? false,
        componentName: props.componentName as ExternalComponentType,
    })
);

watchEffect(onCleanup => {
    const unsubscribe = analytics.value.subscribe(pushEvent);
    onCleanup(unsubscribe);
});

const userEvents = computed(() => analytics.value.userEvents);

provide(EVENT_DISPATCHER_CONTEXT_KEY, userEvents);
</script>

<template>
    <slot />
</template>
