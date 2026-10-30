import { defineComponent, h, type PropType } from 'vue';
import { BentoLoadingIndicator } from '@adyen/bento-vue3';
import { ErrorMessageDisplay } from '../ErrorMessageDisplay';
import type { ErrorMessageInfo } from '../../errors/domainErrorResolver';
import styles from './ComponentShell.module.scss';

export type ComponentShellState = 'loading' | 'error' | 'ready';

/**
 * Renders exactly one of the loading, error or content states for an external component. The loading
 * state is a centred spinner unless the component fills the `loading` slot with its own placeholder.
 *
 * Titles stay with the components, which guard headings on conditions the shell cannot see, such as
 * being rendered within a modal or hidden on a flow step.
 */
export const ComponentShell = defineComponent({
    name: 'ComponentShell',

    props: {
        state: { type: String as PropType<ComponentShellState>, default: 'ready' },
        /**
         * Required whenever `state` is `error`. The shell has no domain copy of its own, so the
         * calling domain resolves the error with its own vocabulary and passes the result in.
         */
        errorInfo: { type: Object as PropType<ErrorMessageInfo | undefined>, default: undefined },
        onRefresh: { type: Function as PropType<(() => void) | undefined>, default: undefined },
    },

    setup(props, { slots }) {
        const renderBody = () => {
            switch (props.state) {
                case 'loading': {
                    // Loading content passed by the component lays itself out; the centred spinner is
                    // the fallback.
                    const loadingContent = slots.loading?.();
                    const hasLoadingContent = !!loadingContent?.length;

                    // The Bento spinner is decorative (aria-hidden), so the wrapper carries aria-busy.
                    return h(
                        'div',
                        { class: hasLoadingContent ? undefined : styles.loading, 'aria-busy': 'true' },
                        hasLoadingContent ? loadingContent : [h(BentoLoadingIndicator)]
                    );
                }
                case 'error':
                    if (!props.errorInfo) return null;
                    // Flush: the display's own outline and background would draw a second box.
                    return h(ErrorMessageDisplay, {
                        errorInfo: props.errorInfo,
                        onRefresh: props.onRefresh,
                        withImage: true,
                        absolutePosition: false,
                        outlined: false,
                        withBackground: false,
                    });
                default:
                    return slots.default?.();
            }
        };

        return () => renderBody() ?? null;
    },
});

export default ComponentShell;
