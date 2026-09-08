<script setup lang="ts">
import { inject, provide, ref } from 'vue';
import { useBentoTranslationOverrides } from '@adyen/bento-vue3';
import type { CoreInstance } from './types';
import CoreProvider from './Context/CoreProvider.vue';
import ConfigProvider from './ConfigContext/ConfigProvider.vue';
import EventDispatcherProvider from './Context/eventDispatcher/EventDispatcherProvider.vue';
import type { ExternalComponentType } from '@integration-components/types';
import { COMPONENT_REF_KEY, DOMAIN_TRANSLATION_BINDING_KEY } from './Context/constants';
import './UIElement.scss';

interface Props {
    core: CoreInstance;
    bentoOverrides: Record<string, string>;
    componentName: ExternalComponentType;
    customClassNames?: string;
    refreshComponent: () => void;
}

const props = defineProps<Props>();
const componentRef = ref<HTMLDivElement | null>(null);
const domainTranslations = inject(DOMAIN_TRANSLATION_BINDING_KEY);

if (!domainTranslations) throw new Error('[UIElementProvider] Domain translations must be configured before mounting.');

provide(COMPONENT_REF_KEY, componentRef);
useBentoTranslationOverrides(props.bentoOverrides);
</script>

<template>
    <CoreProvider
        :i18n="domainTranslations.i18n"
        :translation-domain="domainTranslations.translationDomain"
        :loading-context="props.core.loadingContext"
        :get-cdn-config="props.core.getCdnConfig"
        :get-cdn-dataset="props.core.getCdnDataset"
        :get-image-asset="props.core.getImageAsset"
        :external-error-handler="props.core.options.onError"
        :environment="props.core.options.environment"
        :refresh-component="props.refreshComponent"
    >
        <ConfigProvider :session="props.core.session" :type="props.componentName" :translation-domain="domainTranslations.translationDomain">
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
