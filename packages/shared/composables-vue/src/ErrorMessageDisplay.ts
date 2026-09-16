import { defineComponent, computed, h, type PropType, type VNode } from 'vue';
import { BentoButton, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import type { TranslationKey } from '@integration-components/core';
import { getErrorMessage, type ErrorMessageInfo, type ErrorWithCode } from './getErrorMessage';
import { useShouldHideIllustrations } from './customization';
import styles from './ErrorMessageDisplay.module.scss';

const IMAGE_BREAKPOINT_MEDIUM_PX = 680;

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
        const { i18n, refreshComponent: refreshCurrentComponent, getImageAsset } = useCoreContext();
        const hideIllustrations = useShouldHideIllustrations();

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

        const renderIllustration = () =>
            h('div', { class: styles.illustration }, [
                h('picture', {}, [
                    h('source', {
                        type: 'image/svg+xml',
                        media: `(min-width: ${IMAGE_BREAKPOINT_MEDIUM_PX}px)`,
                        srcset: props.imageDesktop ?? getImageAsset?.({ name: 'wrong-environment' }),
                    }),
                    h('source', {
                        type: 'image/svg+xml',
                        media: `(max-width: ${IMAGE_BREAKPOINT_MEDIUM_PX}px)`,
                        srcset: props.imageMobile ?? getImageAsset?.({ name: 'wrong-environment', subFolder: 'images/small' }),
                    }),
                    h('img', { src: props.imageDesktop ?? getImageAsset?.({ name: 'wrong-environment' }), alt: '' }),
                ]),
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

        const renderButtons = () => {
            const { onContactSupport, refreshComponent, contactSupportLabel } = errorInfo.value;
            const buttons: VNode[] = [];

            if (props.onDismiss && props.dismissLabel) {
                const dismiss = props.onDismiss;
                buttons.push(h(BentoButton, { type: 'button', variant: 'secondary', onClick: () => dismiss() }, () => i18n.get(props.dismissLabel!)));
            }

            if (onContactSupport) {
                buttons.push(
                    h(BentoButton, { type: 'button', variant: 'primary', onClick: () => onContactSupport() }, () =>
                        i18n.get(contactSupportLabel ?? 'common.actions.contactSupport.labels.reachOut')
                    )
                );
            } else if (refreshComponent) {
                const refresh = props.onRefresh ?? refreshCurrentComponent;
                buttons.push(
                    h(BentoButton, { type: 'button', variant: 'primary', onClick: () => refresh?.() }, () =>
                        i18n.get('common.actions.refresh.labels.default')
                    )
                );
            }

            return buttons;
        };

        return () => {
            const { title } = errorInfo.value;
            const messages = renderMessages();
            const buttons = renderButtons();

            return h('div', { class: rootClass.value, 'data-testid': 'error-message-display' }, [
                !hideIllustrations.value && (props.withImage || props.imageDesktop || props.imageMobile) ? renderIllustration() : null,
                title ? h(BentoTypography, { el: 'div', variant: 'title' }, () => i18n.get(title)) : null,
                messages.length ? h(BentoTypography, { variant: 'body' }, () => messages) : null,
                buttons.length ? h('div', { class: styles.button }, buttons) : null,
            ]);
        };
    },
});

export default ErrorMessageDisplay;
