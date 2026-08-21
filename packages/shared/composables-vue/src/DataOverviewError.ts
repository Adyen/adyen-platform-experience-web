import { computed, defineComponent, h, type Component, type PropType, type VNode } from 'vue';
import { BentoEmptyState } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import type { TranslationKey } from '@integration-components/core';
import { getErrorMessage, type ErrorMessageInfo, type ErrorWithCode } from './getErrorMessage';

export const DataOverviewError = defineComponent({
    name: 'DataOverviewError',

    props: {
        error: { type: Object as PropType<ErrorWithCode | undefined>, default: undefined },
        errorMessage: { type: String as PropType<TranslationKey>, default: undefined },
        notFoundMessage: { type: String as PropType<TranslationKey>, default: undefined },
        errorInfo: { type: Object as PropType<ErrorMessageInfo>, default: undefined },
        onContactSupport: { type: Function as PropType<() => void>, default: undefined },
        variant: { type: String as PropType<'embedded' | 'condensed'>, default: 'embedded' },
        image: { type: String as PropType<'wrong-environment' | 'no-results-found'>, default: 'wrong-environment' },
        refreshIcon: { type: [Object, Function] as PropType<Component>, default: undefined },
        copyIcon: { type: [Object, Function] as PropType<Component>, default: undefined },
    },

    setup(props) {
        const { i18n, refreshComponent: refreshCurrentComponent } = useCoreContext();

        const errorInfo = computed(
            () =>
                props.errorInfo ??
                getErrorMessage(props.error, props.errorMessage ?? 'common.errors.unexpected', props.onContactSupport, props.notFoundMessage)
        );

        const title = computed(() => (errorInfo.value.title ? i18n.get(errorInfo.value.title) : undefined));

        const description = computed(() => {
            const { messages, requestId } = errorInfo.value;
            const options = requestId ? { values: { requestId } } : undefined;
            const nodes: VNode[] = [];

            messages.forEach((key, index) => {
                if (index > 0) nodes.push(h('br'));
                nodes.push(h('span', { key }, i18n.get(key, options)));
            });

            return nodes;
        });

        const action = computed<
            | {
                  title: string;
                  event: () => void;
                  icon?: Component;
                  variant: 'primary' | 'secondary';
              }
            | undefined
        >(() => {
            const { onContactSupport, refreshComponent, requestId, contactSupportLabel } = errorInfo.value;

            if (onContactSupport) {
                return {
                    title: i18n.get(contactSupportLabel ?? 'common.actions.contactSupport.labels.reachOut'),
                    event: onContactSupport,
                    variant: 'primary' as const,
                };
            }

            if (refreshComponent) {
                return {
                    title: i18n.get('common.actions.refresh.labels.default'),
                    event: () => refreshCurrentComponent?.(),
                    icon: props.refreshIcon,
                    variant: 'primary' as const,
                };
            }

            if (requestId && typeof navigator !== 'undefined' && navigator.clipboard) {
                return {
                    title: i18n.get('common.actions.copy.labels.errorCode'),
                    event: () => void navigator.clipboard.writeText(requestId),
                    icon: props.copyIcon,
                    variant: 'secondary' as const,
                };
            }

            return undefined;
        });

        return () =>
            h(
                BentoEmptyState,
                {
                    image: props.image,
                    variant: props.variant,
                    title: title.value,
                    action: action.value,
                },
                { default: () => description.value }
            );
    },
});

export default DataOverviewError;
