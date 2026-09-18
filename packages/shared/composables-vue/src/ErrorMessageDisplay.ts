import { defineComponent, computed, h, type Component, type PropType, type VNode } from 'vue';
import { BentoButton, BentoEmptyState } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import type { TranslationKey } from '@integration-components/core';
import { getErrorMessage, type ErrorMessageInfo, type ErrorWithCode } from './getErrorMessage';
import styles from './ErrorMessageDisplay.module.scss';

export const ErrorMessageDisplay = defineComponent({
    name: 'ErrorMessageDisplay',

    props: {
        error: { type: Object as PropType<ErrorWithCode | undefined>, default: undefined },
        errorMessage: { type: String as PropType<TranslationKey>, default: undefined },
        notFoundMessage: { type: String as PropType<TranslationKey>, default: undefined },
        errorInfo: { type: Object as PropType<ErrorMessageInfo>, default: undefined },
        onContactSupport: { type: Function as PropType<() => void>, default: undefined },
        onDismiss: { type: Function as PropType<() => void>, default: undefined },
        dismissLabel: { type: String as PropType<TranslationKey>, default: undefined },
        onRefresh: { type: Function as PropType<() => void>, default: undefined },
        withImage: { type: Boolean, default: false },
        outlined: { type: Boolean, default: true },
        absolutePosition: { type: Boolean, default: true },
        withBackground: { type: Boolean, default: true },
        centered: { type: Boolean, default: false },
        condensed: { type: Boolean, default: false },
        withHeaderOffset: { type: Boolean, default: false },
        imageDesktop: { type: String, default: undefined },
        imageMobile: { type: String, default: undefined },
    },

    setup(props) {
        const { i18n, refreshComponent: refreshCurrentComponent } = useCoreContext();

        const errorInfo = computed(
            () =>
                props.errorInfo ??
                getErrorMessage(props.error, props.errorMessage ?? 'common.errors.unexpected', props.onContactSupport, props.notFoundMessage)
        );

        const rootClass = computed(() => [
            styles.root,
            props.absolutePosition ? styles.absolutePositioned : '',
            props.centered ? styles.centered : '',
            props.outlined ? styles.outlined : '',
            props.withBackground && !props.outlined ? styles.withBackground : '',
            props.withHeaderOffset ? styles.withHeaderOffset : '',
            props.condensed ? styles.condensed : '',
        ]);

        const renderMessages = () => {
            const { messages, requestId } = errorInfo.value;
            const options = requestId ? { values: { requestId } } : undefined;
            const nodes: (VNode | string)[] = [];
            messages.forEach((key, index) => {
                if (index > 0) nodes.push(' ', h('br'), ' ');
                nodes.push(i18n.get(key, options));
            });
            return nodes;
        };

        const primaryAction = computed<
            | {
                  title: string;
                  event: () => void;
                  icon?: Component;
              }
            | undefined
        >(() => {
            const { onContactSupport, refreshComponent, contactSupportLabel } = errorInfo.value;

            if (onContactSupport) {
                return {
                    title: i18n.get(contactSupportLabel ?? 'common.actions.contactSupport.labels.reachOut'),
                    event: onContactSupport,
                };
            }

            if (refreshComponent) {
                const refresh = props.onRefresh ?? refreshCurrentComponent;
                return {
                    title: i18n.get('common.actions.refresh.labels.default'),
                    event: () => refresh?.(),
                };
            }

            return undefined;
        });

        const variant = computed(() => {
            if (props.condensed) return 'condensed';
            if (props.withImage || props.imageDesktop || props.imageMobile) return 'full-page';
            return 'basic';
        });

        const image = computed(() => {
            if (props.imageDesktop || props.imageMobile) return 'no-results-found';
            if (props.withImage) return 'wrong-environment';
            return undefined;
        });

        return () => {
            const { title } = errorInfo.value;
            const messages = renderMessages();

            return h('div', { class: rootClass.value, 'data-testid': 'error-message-display' }, [
                h(
                    BentoEmptyState,
                    {
                        action: primaryAction.value,
                        image: image.value,
                        title: title ? i18n.get(title) : undefined,
                        variant: variant.value,
                    },
                    { default: () => messages }
                ),
                props.onDismiss && props.dismissLabel
                    ? h(
                          'div',
                          { class: styles.button },
                          h(BentoButton, { type: 'button', variant: 'secondary', onClick: props.onDismiss }, () => i18n.get(props.dismissLabel!))
                      )
                    : null,
            ]);
        };
    },
});

export default ErrorMessageDisplay;
