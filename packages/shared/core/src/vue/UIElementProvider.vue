<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import type { Appearance, CoreInstance } from './types';
import CoreProvider from './Context/CoreProvider.vue';
import { resolveAppearance } from './customization';
import ConfigProvider from './ConfigContext/ConfigProvider.vue';
import EventDispatcherProvider from './Context/eventDispatcher/EventDispatcherProvider.vue';
import type { ExternalComponentType } from '@integration-components/types';
import { COMPONENT_REF_KEY } from './Context/constants';
import './UIElement.scss';

interface Props {
    core: CoreInstance;
    componentName: ExternalComponentType;
    componentAppearance?: Appearance;
    customClassNames?: string;
    globalAppearance?: Appearance;
    refreshComponent: () => void;
}

const props = defineProps<Props>();
const componentRef = ref<HTMLDivElement | null>(null);
const appearance = computed(() => resolveAppearance(props.globalAppearance ?? props.core.options.appearance, props.componentAppearance));
provide(COMPONENT_REF_KEY, componentRef);
</script>

<template>
    <CoreProvider
        :i18n="props.core.i18n"
        :appearance="appearance"
        :loading-context="props.core.loadingContext"
        :get-cdn-config="props.core.getCdnConfig"
        :get-cdn-dataset="props.core.getCdnDataset"
        :get-image-asset="props.core.getImageAsset"
        :external-error-handler="props.core.options.onError"
        :refresh-component="props.refreshComponent"
    >
        <ConfigProvider :session="props.core.session" :type="props.componentName">
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
