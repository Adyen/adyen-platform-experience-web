import { computed, defineComponent, h, mergeProps, type PropType, type VNodeChild, withDirectives } from 'vue';
import { BentoButton, BentoTooltipDirective } from '@adyen/bento-vue3';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import type { TranslationKey } from '@integration-components/core';
import { useCoreContext } from '@integration-components/core/vue';
import accessibilityStyles from '@integration-components/style/accessibility.module.scss';
import { useCopyText } from './useCopyText';
import { useLiveAnnouncement } from './useLiveAnnouncement';
import styles from './CopyText.module.scss';

export type CopyTextType = 'Default' | 'Text' | 'Trimmed';

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
        const { announce, announcement } = useLiveAnnouncement();
        const { copyText, isCopied, resetCopyState } = useCopyText(
            () => props.textToCopy,
            () => {
                props.onCopyText?.();
                announce(() => i18n.get('common.actions.copy.labels.done'));
            }
        );
        const copyButtonLabel = computed(() => i18n.get(props.copyButtonAriaLabelKey ?? 'common.actions.copy.labels.default'));
        const copyButtonTooltip = computed(() => i18n.get(isCopied.value ? 'common.actions.copy.labels.done' : 'common.actions.copy.labels.default'));

        return () => {
            const visibleText = h(
                'span',
                {
                    class: [
                        props.type === 'Trimmed' && styles.information,
                        props.type !== 'Default' && styles.label,
                        props.stronger && styles.stronger,
                        props.type === 'Text' && styles.text,
                        props.isUnderlineVisible && styles.underline,
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
                        class: styles.root,
                        'data-testid': 'copyText',
                        variant: 'tertiary',
                        onBlur: resetCopyState,
                        onClick: copyText,
                        onMouseleave: resetCopyState,
                    },
                    {
                        iconRight: () => h('div', { class: styles.icon }, [h(CopyIcon)]),
                    }
                ),
                [[BentoTooltipDirective, copyButtonTooltip.value]]
            );

            return h('span', mergeProps(attrs, { class: styles.container }), [
                textWithTooltip,
                copyButton,
                h('span', { class: accessibilityStyles.visuallyHidden, 'aria-atomic': 'true', 'aria-live': 'polite' }, announcement.value),
            ]);
        };
    },
});

export default CopyText;
