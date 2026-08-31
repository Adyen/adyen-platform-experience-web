import { computed, defineComponent, h, mergeProps, type PropType, type VNodeChild, withDirectives } from 'vue';
import { BentoButton, BentoTooltipDirective } from '@adyen/bento-vue3';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import type { TranslationKey } from '@integration-components/core';
import { useCoreContext } from '@integration-components/core/vue';
import { useCopyText } from './useCopyText';
import './CopyText.scss';

export type CopyTextType = 'Default' | 'Text' | 'Trimmed';

const BASE_CLASSNAME = 'adyen-pe-copy-text';

const classes = {
    base: BASE_CLASSNAME,
    container: `${BASE_CLASSNAME}__container`,
    icon: `${BASE_CLASSNAME}__icon`,
    information: `${BASE_CLASSNAME}__information`,
    label: `${BASE_CLASSNAME}__label`,
    stronger: `${BASE_CLASSNAME}--stronger`,
    text: `${BASE_CLASSNAME}__text`,
    underline: 'adyen-pe-tooltip-target--underlined',
};

export const CopyText = defineComponent({
    name: 'CopyText',

    inheritAttrs: false,

    props: {
        copyButtonAriaLabelKey: { type: String as PropType<TranslationKey>, default: undefined },
        isUnderlineVisible: { type: Boolean, default: false },
        onCopyText: { type: Function as PropType<() => void>, default: undefined },
        showCopyTextTooltip: { type: Boolean, default: true },
        stronger: { type: Boolean, default: false },
        textToCopy: { type: String, required: true },
        type: { type: String as PropType<CopyTextType>, default: 'Trimmed' },
        visibleText: { type: null as unknown as PropType<VNodeChild>, default: undefined },
    },

    setup(props, { attrs, slots }) {
        const { i18n } = useCoreContext();
        const { copyText, isCopied, resetCopyState } = useCopyText(
            () => props.textToCopy,
            () => props.onCopyText?.()
        );
        const copyButtonLabel = computed(() => i18n.get(props.copyButtonAriaLabelKey ?? 'common.actions.copy.labels.default'));
        const copyButtonTooltip = computed(() => i18n.get(isCopied.value ? 'common.actions.copy.labels.done' : 'common.actions.copy.labels.default'));

        return () => {
            const visibleText = h(
                'span',
                {
                    class: [
                        props.type === 'Trimmed' && classes.information,
                        props.type !== 'Default' && classes.label,
                        props.stronger && classes.stronger,
                        props.type === 'Text' && classes.text,
                        props.isUnderlineVisible && classes.underline,
                    ],
                },
                (slots.default?.() ?? props.visibleText) || props.textToCopy
            );
            const textWithTooltip = props.showCopyTextTooltip
                ? withDirectives(visibleText, [[BentoTooltipDirective, props.textToCopy]])
                : visibleText;
            const copyButton = withDirectives(
                h(
                    BentoButton,
                    {
                        'aria-label': copyButtonLabel.value,
                        class: classes.base,
                        'data-testid': 'copyText',
                        variant: 'tertiary',
                        onBlur: resetCopyState,
                        onClick: copyText,
                        onMouseleave: resetCopyState,
                    },
                    {
                        iconRight: () => h('div', { class: classes.icon }, [h(CopyIcon)]),
                    }
                ),
                [[BentoTooltipDirective, copyButtonTooltip.value]]
            );

            return h('span', mergeProps(attrs, { class: classes.container }), [
                textWithTooltip,
                copyButton,
                h(
                    'div',
                    { class: 'adyen-pe-visually-hidden', 'aria-atomic': 'true', 'aria-live': 'polite' },
                    isCopied.value ? copyButtonTooltip.value : ''
                ),
            ]);
        };
    },
});

export default CopyText;
