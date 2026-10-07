<script setup lang="ts">
import { computed, inject, provide, ref, useSlots } from 'vue';
import type { Appearance, CoreInstance } from './types';
import { useBentoTranslationOverrides } from '@adyen/bento-vue3';
import CoreProvider from './Context/CoreProvider.vue';
import { resolveAppearance } from './customization';
import ConfigProvider from './ConfigContext/ConfigProvider.vue';
import EventDispatcherProvider from './Context/eventDispatcher/EventDispatcherProvider.vue';
import type { ExternalComponentType } from '@integration-components/types';
import { COMPONENT_REF_KEY, DOMAIN_TRANSLATION_BINDING_KEY } from './Context/constants';
import ComponentAvailabilityGate from './componentAvailability/ComponentAvailabilityGate';
import styles from './UIElement.module.scss';
import './UIElement.scss';

interface Props {
    core: CoreInstance;
    bentoOverrides: Record<string, string>;
    componentName: ExternalComponentType;
    componentAppearance?: Appearance;
    globalAppearance?: Appearance;
    refreshComponent: () => void;
}

const props = defineProps<Props>();
const componentRef = ref<HTMLDivElement | null>(null);
const slots = useSlots();
const appearance = computed(() => resolveAppearance(props.globalAppearance ?? props.core.options.appearance, props.componentAppearance));
const domainTranslations = inject(DOMAIN_TRANSLATION_BINDING_KEY);

if (!domainTranslations) throw new Error('[UIElementProvider] Domain translations must be configured before mounting.');

// The gated component is the slot's root vnode; surface its `onContactSupport` prop so the
// availability error can offer a contact-support action.
const onContactSupport = computed(() => {
    const component = (slots.default?.() ?? [])[0];
    const componentProps = component?.props as Record<string, unknown> | null | undefined;
    return componentProps?.onContactSupport as (() => void) | undefined;
});

provide(COMPONENT_REF_KEY, componentRef);
useBentoTranslationOverrides(props.bentoOverrides);
</script>

<template>
    <CoreProvider
        :i18n="domainTranslations.i18n"
        :translation-domain="domainTranslations.translationDomain"
        :appearance="appearance"
        :loading-context="props.core.loadingContext"
        :get-cdn-config="props.core.getCdnConfig"
        :get-cdn-dataset="props.core.getCdnDataset"
        :get-image-asset="props.core.getImageAsset"
        :external-error-handler="props.core.options.onError"
        :environment="props.core.options.environment"
        :refresh-component="props.refreshComponent"
    >
        <ConfigProvider :session="props.core.session" :type="props.componentName">
            <EventDispatcherProvider :component-name="props.componentName" :analytics-enabled="props.core.analyticsEnabled ?? true">
                <section ref="componentRef" class="adyen-pe-component" data-testid="component-root">
                    <div :class="styles.container">
                        <ComponentAvailabilityGate :type="props.componentName" :on-contact-support="onContactSupport">
                            <slot />
                        </ComponentAvailabilityGate>
                    </div>
                </section>
            </EventDispatcherProvider>
        </ConfigProvider>
    </CoreProvider>
</template>
