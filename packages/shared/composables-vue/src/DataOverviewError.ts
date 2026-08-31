import { defineComponent, h, type PropType, type VNode } from 'vue';
import { BentoEmptyState } from '@adyen/bento-vue3';
import accessibilityStyles from '@integration-components/style/accessibility.module.scss';
import type { DataOverviewErrorAction } from './useDataOverviewError';

export const DataOverviewError = defineComponent({
    name: 'DataOverviewError',

    props: {
        action: { type: Object as PropType<DataOverviewErrorAction>, default: undefined },
        announcement: { type: String, default: '' },
        image: { type: String as PropType<'wrong-environment' | 'no-results-found'>, default: 'wrong-environment' },
        joinMessages: { type: Boolean, default: false },
        messages: { type: Array as PropType<readonly string[]>, required: true },
        title: { type: String, default: undefined },
        variant: { type: String as PropType<'embedded' | 'condensed'>, default: 'embedded' },
    },

    setup(props) {
        const renderDescription = () => {
            const nodes: VNode[] = [];

            if (props.joinMessages) {
                const messages: (string | VNode)[] = [];
                props.messages.forEach((message, index) => {
                    if (index > 0) messages.push(' ', h('br'), ' ');
                    messages.push(message);
                });
                nodes.push(h('span', { key: 'messages' }, messages));
            } else {
                props.messages.forEach((message, index) => {
                    if (index > 0) nodes.push(h('br'));
                    nodes.push(h('span', { key: index }, message));
                });
            }

            nodes.push(h('span', { class: accessibilityStyles.visuallyHidden, 'aria-atomic': 'true', 'aria-live': 'polite' }, props.announcement));

            return nodes;
        };

        return () =>
            h(
                BentoEmptyState,
                {
                    action: props.action,
                    image: props.image,
                    title: props.title,
                    variant: props.variant,
                },
                { default: renderDescription }
            );
    },
});

export default DataOverviewError;
