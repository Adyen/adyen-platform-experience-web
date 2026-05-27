<script setup lang="ts">
import type { CoreInstance } from './types';
import CoreProvider from './Context/CoreProvider.vue';
import ConfigProvider from './ConfigContext/ConfigProvider.vue';
import EventDispatcherProvider from './Context/eventDispatcher/EventDispatcherProvider.vue';
import './UIElement.scss';

interface Props {
    core: CoreInstance;
    componentName?: string;
    customClassNames?: string;
}

const props = defineProps<Props>();
</script>

<template>
    <CoreProvider
        :i18n="props.core.i18n"
        :loading-context="props.core.loadingContext"
        :get-cdn-config="props.core.getCdnConfig"
        :get-cdn-dataset="props.core.getCdnDataset"
        :external-error-handler="props.core.options.onError"
    >
        <ConfigProvider :session="props.core.session">
            <EventDispatcherProvider :component-name="props.componentName" :analytics-enabled="props.core.analyticsEnabled ?? true">
                <section :class="['adyen-pe-component', props.customClassNames]" data-testid="component-root">
                    <div class="adyen-pe-component__container">
                        <slot />
                    </div>
                </section>
            </EventDispatcherProvider>
        </ConfigProvider>
    </CoreProvider>
</template>
