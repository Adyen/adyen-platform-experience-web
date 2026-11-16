import { defineComponent, computed, h, type PropType, type VNode } from 'vue';
import { BentoButton, BentoTypography } from '@adyen/bento-vue3';
import ErrorIcon from '@adyen/ui-assets-icons-24/vue/cross-circle';
import { useCoreContext } from './Context';
import { getSafeDomainTranslationKey } from '../translations';
import type { ErrorMessageInfo } from '../errors/domainErrorResolver';
import styles from './ErrorMessageDisplay.module.scss';

export const ErrorMessageDisplay = defineComponent({
    name: 'ErrorMessageDisplay',

    props: {
        errorInfo: { type: Object as PropType<ErrorMessageInfo>, required: true },
        onRefresh: { type: Function as PropType<() => void>, default: undefined },
        withImage: { type: Boolean, default: false },
        outlined: { type: Boolean, default: true },
        absolutePosition: { type: Boolean, default: true },
        withBackground: { type: Boolean, default: true },
        centered: { type: Boolean, default: false },
        condensed: { type: Boolean, default: false },
        withHeaderOffset: { type: Boolean, default: false },
    },

    setup(props) {
        const { i18n, refreshComponent: refreshCurrentComponent, translationDomain } = useCoreContext();

        const errorInfo = computed(() => props.errorInfo);

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

        const renderButtons = () => {
            const { onContactSupport, refreshComponent } = errorInfo.value;
            const buttons: VNode[] = [];

            if (onContactSupport) {
                buttons.push(
                    h(BentoButton, { type: 'button', variant: 'primary', onClick: () => onContactSupport() }, () =>
                        i18n.get(getSafeDomainTranslationKey(translationDomain, 'common.contactSupport.label'))
                    )
                );
            } else if (refreshComponent) {
                const refresh = props.onRefresh ?? refreshCurrentComponent;
                buttons.push(
                    h(BentoButton, { type: 'button', variant: 'primary', onClick: () => refresh?.() }, () =>
                        i18n.get(getSafeDomainTranslationKey(translationDomain, 'common.refresh.label'))
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
                props.withImage ? h(ErrorIcon, { 'aria-hidden': 'true', class: styles.iconCritical }) : null,
                title ? h(BentoTypography, { el: 'div', variant: 'title' }, () => i18n.get(title)) : null,
                messages.length ? h(BentoTypography, { variant: 'body' }, () => messages) : null,
                buttons.length ? h('div', { class: styles.button }, buttons) : null,
            ]);
        };
    },
});

export default ErrorMessageDisplay;
