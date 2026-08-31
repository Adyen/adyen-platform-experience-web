import { defineComponent, computed, h, type PropType, type VNode } from 'vue';
import { BentoButton, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import type { TranslationKey } from '@integration-components/core';
import { getErrorMessage, type ErrorMessageInfo, type ErrorMessageKeys, type ErrorWithCode } from './getErrorMessage';
import type { DataOverviewActionKeys } from './useDataOverviewError';
import styles from './ErrorMessageDisplay.module.scss';

const IMAGE_BREAKPOINT_MEDIUM_PX = 680;

export const ErrorMessageDisplay = defineComponent({
    name: 'ErrorMessageDisplay',

    props: {
        error: { type: Object as PropType<ErrorWithCode | undefined>, default: undefined },
        // Keys are supplied by the embedding domain: its local translation names are opaque to
        // portable code, so no cross-domain defaults are hardcoded here. The `string` types
        // accept any domain catalog key; the cast below matches the runtime i18n signature.
        errorMessage: { type: String as PropType<string>, default: undefined },
        notFoundMessage: { type: String as PropType<string>, default: undefined },
        errorInfo: { type: Object as PropType<ErrorMessageInfo<string>>, default: undefined },
        errorKeys: { type: Object as PropType<ErrorMessageKeys<string>>, default: undefined },
        actionKeys: { type: Object as PropType<DataOverviewActionKeys<string>>, default: undefined },
        onContactSupport: { type: Function as PropType<() => void>, default: undefined },
        onDismiss: { type: Function as PropType<() => void>, default: undefined },
        dismissLabel: { type: String as PropType<string>, default: undefined },
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

        const translate = (key: string, options?: { values: Record<string, unknown> }) => i18n.get(key as TranslationKey, options);

        const errorInfo = computed<ErrorMessageInfo<string> | undefined>(() => {
            if (props.errorInfo) return props.errorInfo;
            if (!props.errorKeys) return undefined;
            return getErrorMessage({
                error: props.error,
                keys: props.errorKeys,
                message: props.errorMessage ?? props.errorKeys.unexpected,
                notFoundMessage: props.notFoundMessage,
                onContactSupport: props.onContactSupport,
            });
        });

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
            const { messages, requestId } = errorInfo.value ?? { messages: [] as string[], requestId: undefined };
            const options = requestId ? { values: { requestId } } : undefined;
            const nodes: (VNode | string)[] = [];
            messages.forEach((key, index) => {
                if (index > 0) nodes.push(' ', h('br'), ' ');
                nodes.push(translate(key, options));
            });
            return nodes;
        };

        const renderButtons = () => {
            const { onContactSupport, refreshComponent, contactSupportLabel } = errorInfo.value ?? {};
            const buttons: VNode[] = [];

            if (props.onDismiss && props.dismissLabel) {
                const dismiss = props.onDismiss;
                buttons.push(
                    h(BentoButton, { type: 'button', variant: 'secondary', onClick: () => dismiss() }, () => translate(props.dismissLabel!))
                );
            }

            if (onContactSupport) {
                const contactSupport = contactSupportLabel ?? props.actionKeys?.contactSupport;
                buttons.push(
                    h(BentoButton, { type: 'button', variant: 'primary', onClick: () => onContactSupport() }, () =>
                        contactSupport ? translate(contactSupport) : ''
                    )
                );
            } else if (refreshComponent) {
                const refresh = props.onRefresh ?? refreshCurrentComponent;
                const refreshLabel = props.actionKeys?.refresh;
                buttons.push(
                    h(BentoButton, { type: 'button', variant: 'primary', onClick: () => refresh?.() }, () =>
                        refreshLabel ? translate(refreshLabel) : ''
                    )
                );
            }

            return buttons;
        };

        return () => {
            const { title } = errorInfo.value ?? {};
            const messages = renderMessages();
            const buttons = renderButtons();

            return h('div', { class: rootClass.value, 'data-testid': 'error-message-display' }, [
                props.withImage || props.imageDesktop || props.imageMobile ? renderIllustration() : null,
                title ? h(BentoTypography, { el: 'div', variant: 'title' }, () => translate(title)) : null,
                messages.length ? h(BentoTypography, { variant: 'body' }, () => messages) : null,
                buttons.length ? h('div', { class: styles.button }, buttons) : null,
            ]);
        };
    },
});

export default ErrorMessageDisplay;
