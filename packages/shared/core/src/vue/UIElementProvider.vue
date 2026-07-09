<script setup lang="ts">
import { ref, provide } from 'vue';
import type { CoreInstance } from './types';
import CoreProvider from './Context/CoreProvider.vue';
import ConfigProvider from './ConfigContext/ConfigProvider.vue';
import EventDispatcherProvider from './Context/eventDispatcher/EventDispatcherProvider.vue';
import type { ExternalComponentType } from '@integration-components/types';
import { COMPONENT_REF_KEY } from './Context/constants';
import './UIElement.scss';

interface Props {
    core: CoreInstance;
    componentName?: ExternalComponentType;
    customClassNames?: string;
}

const props = defineProps<Props>();

const componentRef = ref<HTMLDivElement | null>(null);
provide(COMPONENT_REF_KEY, componentRef);
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
                <section ref="componentRef" :class="['adyen-pe-component', props.customClassNames]" data-testid="component-root">
                    <div class="adyen-pe-component__container">
                        <slot />
                    </div>
                </section>
            </EventDispatcherProvider>
        </ConfigProvider>
    </CoreProvider>
</template>
