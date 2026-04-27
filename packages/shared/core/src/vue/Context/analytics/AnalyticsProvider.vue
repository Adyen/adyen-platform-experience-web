<script setup lang="ts">
import { provide, computed, onMounted, onUnmounted } from 'vue';
import type { UserEvents, EventQueueItem } from './types';
import { ANALYTICS_CONTEXT_KEY } from './constants';

const noop = () => {};

const defaultUserEvents: UserEvents = {
    addEvent: noop,
    addJourneyEvent: noop,
    addTaskEvent: noop,
    addPageEvent: noop,
    addFieldEvent: noop,
    startEvent: noop,
    subscribe: noop,
    unsubscribe: noop,
    updateBaseTrackingPayload: noop,
    updateSharedEventProperties: noop,
};

interface Props {
    componentName?: string;
    analyticsEnabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    analyticsEnabled: false,
});

const subscribers = new Set<(event: EventQueueItem) => void>();
let basePayload: Record<string, any> = {};
let sharedProperties: Record<string, any> = {};

function createEvent(name: string, properties?: Record<string, any>): EventQueueItem {
    return {
        name,
        properties: { ...basePayload, ...sharedProperties, ...properties },
    };
}

function notifySubscribers(event: EventQueueItem) {
    if (props.analyticsEnabled) {
        subscribers.forEach(callback => callback(event));
    }
}

const userEvents = computed<UserEvents>(() => {
    if (!props.analyticsEnabled) {
        return defaultUserEvents;
    }

    return {
        addEvent: (event: EventQueueItem) => notifySubscribers(createEvent(event.name, event.properties)),
        addJourneyEvent: (event: EventQueueItem) => notifySubscribers(createEvent(`journey.${event.name}`, event.properties)),
        addTaskEvent: (event: EventQueueItem) => notifySubscribers(createEvent(`task.${event.name}`, event.properties)),
        addPageEvent: (event: EventQueueItem) => notifySubscribers(createEvent(`page.${event.name}`, event.properties)),
        addFieldEvent: (event: EventQueueItem) => notifySubscribers(createEvent(`field.${event.name}`, event.properties)),
        startEvent: (event: EventQueueItem) => notifySubscribers(createEvent(`start.${event.name}`, event.properties)),
        subscribe: (callback: (event: EventQueueItem) => void) => {
            subscribers.add(callback);
        },
        unsubscribe: (callback: (event: EventQueueItem) => void) => {
            subscribers.delete(callback);
        },
        updateBaseTrackingPayload: (payload: Record<string, any>) => {
            basePayload = { ...basePayload, ...payload };
        },
        updateSharedEventProperties: (properties: Record<string, any>) => {
            sharedProperties = { ...sharedProperties, ...properties };
        },
    };
});

provide(ANALYTICS_CONTEXT_KEY, userEvents.value);

onMounted(() => {
    if (props.analyticsEnabled) {
        userEvents.value.updateBaseTrackingPayload({
            userAgent: navigator.userAgent,
            componentName: props.componentName,
        });
    }
});

onUnmounted(() => {
    subscribers.clear();
});
</script>

<template>
    <slot />
</template>
